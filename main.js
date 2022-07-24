import { LocationClient, SearchPlaceIndexForSuggestionsCommand, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { Signer } from "@aws-amplify/core";

window.onload = async () => {
  const region = "us-east-2";
  const cognitoPool = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL;
  const box = [
    -83.7995698510551, 42.2257269162292,
    -83.6761661429186, 42.3239369094827,
  ];

  const provider = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({
      region,
    }),
    identityPoolId: cognitoPool
  });

  const credentials = await provider();

  const client = new LocationClient({
    region,
    credentials: credentials
  });

  const transformRequest = (url, resourceType) => {
    if (resourceType === "Style" && !url.includes("://")) {
      // resolve to an AWS URL
      url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    }

    if (url.includes("amazonaws.com")) {
      // only sign AWS requests (with the signature as part of the query string)
      return {
        // @aws-sdk/signature-v4 would be another option, but this needs to be synchronous
        url: Signer.signUrl(url, {
          access_key: credentials.accessKeyId,
          secret_key: credentials.secretAccessKey,
          session_token: credentials.sessionToken,
        }),
      };
    }

    // don't sign
    return { url };
  };

  const map = new maplibregl.Map({
    container: "map",
    center: [-83.73786799698685, 42.27483191285595], // longitude, latitude
    zoom: 11, // initial map zoom
    style: "Map",
    hash: false,
    interactive: false,
    transformRequest,
  })

  let marker;

  $("#address").autocomplete({
    minLength: 3,
    source: async ({ term }, response) => {
      if (!term.length) {
        response([]);
      }

      const command = new SearchPlaceIndexForSuggestionsCommand({
        IndexName: "Index",
        FilterBBox: box,
        MaxResults: 5,
        Text: term,
      });

      const data = await client.send(command);
      response(data.Results.map(d => d.Text));
    },
    select: async (_, { item: { value } }) => {

      const command = new SearchPlaceIndexForTextCommand({
        IndexName: "Index",
        FilterBBox: box,
        MaxResults: 1,
        Text: value,
      });

      const data = await client.send(command);

      const position = data.Results[0].Place.Geometry.Point;
      if (marker) {
        marker.remove();
      }

      marker = new maplibregl.Marker()
        .setLngLat(position)
        .addTo(map);

      map.flyTo({ center: data.Results[0].Place.Geometry.Point });
    }
  });
}