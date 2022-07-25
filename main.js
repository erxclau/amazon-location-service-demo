import { LocationClient, SearchPlaceIndexForSuggestionsCommand, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { Signer } from "@aws-amplify/core";
import { polygonContains } from "d3-polygon";

const getCredentials = async (region, pool) => {
  const provider = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({
      region,
    }),
    identityPoolId: pool
  });

  return await provider();
}

const getRequestTransformer = (region, credentials) => {
  return (url, resourceType) => {
    if (resourceType === "Style" && !url.includes("://")) {
      url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    }

    if (url.includes("amazonaws.com")) {
      return {
        url: Signer.signUrl(url, {
          access_key: credentials.accessKeyId,
          secret_key: credentials.secretAccessKey,
          session_token: credentials.sessionToken,
        }),
      };
    }

    return { url };
  };
}

window.onload = async () => {
  const env = import.meta.env;
  const cognitoPool = (env.MODE === "development") ? env.VITE_DEV_COGNITO_POOL : env.VITE_PROD_COGNITO_POOL;
  const region = cognitoPool.split(":")[0];

  const credentials = await getCredentials(region, cognitoPool);
  const client = new LocationClient({ region, credentials });
  const transformRequest = getRequestTransformer(region, credentials);

  const box = [
    -83.7995698510551, 42.2257269162292,
    -83.6761661429186, 42.3239369094827,
  ];

  const map = new maplibregl.Map({
    container: "map",
    bounds: box,
    style: "ElectionsPollingLocationProductionMap",
    hash: false,
    interactive: false,
    transformRequest,
  })

  let addressMarker;
  let pollingMarker;
  let layer;

  const locationText = document.getElementById("polling-location");

  $("#address").autocomplete({
    minLength: 3,
    source: async ({ term }, response) => {
      if (!term.length) {
        response([]);
      }

      const command = new SearchPlaceIndexForSuggestionsCommand({
        IndexName: "ElectionsPollingLocationProductionIndex",
        FilterBBox: box,
        MaxResults: 5,
        Text: term,
      });

      const data = await client.send(command);
      response(data.Results.map(d => d.Text));
    },
    select: async (_, { item: { value } }) => {
      const command = new SearchPlaceIndexForTextCommand({
        IndexName: "ElectionsPollingLocationProductionIndex",
        FilterBBox: box,
        MaxResults: 1,
        Text: value,
      });

      const data = await client.send(command);

      const position = data.Results[0].Place.Geometry.Point;
      if (addressMarker) {
        addressMarker.remove();
      }

      addressMarker = new maplibregl.Marker()
        .setLngLat(position)
        .addTo(map);

      const bounds = await import("./geojson/bounds.json");
      const locations = await import("./geojson/locations.json");

      const bound = bounds.features
        .filter(f => polygonContains(
          f.geometry.coordinates.at(0).at(0), position
        ))
        .pop();

      const polling = locations.features
        .filter(f => f.properties.WRDPCT === bound.properties.WRDPCT)
        .pop();

      let [long, lat] = polling.geometry.coordinates;

      if (pollingMarker) {
        pollingMarker.remove();
      }

      pollingMarker = new maplibregl.Marker({ color: "#e34829" })
        .setLngLat(polling.geometry.coordinates)
        .addTo(map);

      const address = encodeURIComponent(`${polling.properties.ADDRESS}, Ann Arbor, Michigan`)
      locationText.textContent = `${polling.properties.PLACE}`;
      locationText.style.color = "#e34829";
      locationText.style.fontWeight = "bold";
      locationText.href = `https://maps.google.com/maps/place/${address}/@${lat},${long}`;

      if (!map.getSource('bound-source')) {
        map.addSource(`bound-source`, {
          type: 'geojson',
          data: bound,
        });
      } else {
        map.getSource('bound-source').setData(bound);
      }

      if (!layer) {
        layer = map.addLayer({
          id: `bound-layer`,
          source: `bound-source`,
          type: 'fill',
          paint: {
            "fill-color": "#34aeeb",
            "fill-opacity": 0.7
          }
        });
      }

      let [swLong, swLat, neLong, neLat] = bound.bbox;

      swLong = Math.min(swLong, long);
      swLat = Math.min(swLat, lat);
      neLong = Math.max(neLong, long);
      neLat = Math.max(neLat, lat);

      map.fitBounds([swLong, swLat, neLong, neLat], {
        padding: 75,
      });
    }
  });
}