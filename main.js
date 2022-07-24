window.onload = async () => {
  const cognitoPool = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL;
  const box = [
    -83.7995698510551, 42.2257269162292,
    -83.6761661429186, 42.3239369094827,
  ];

  const map = await AmazonLocation.createMap(
    {
      identityPoolId: cognitoPool,
    },
    {
      container: "map",
      center: [-83.73786799698685, 42.27483191285595], // longitude, latitude
      zoom: 11, // initial map zoom
      style: "Map",
      hash: false,
    }
  );

  map.addControl(new maplibregl.NavigationControl(), "top-left");

  // Find the location and put a marker on the map
  const location = new AWS.Location({
    credentials: await AmazonLocation.getCredentialsForIdentityPool(
      cognitoPool
    ),
    region: "us-east-2",
  });

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(args);
      }, timeout);
    };
  };

  const input = document.getElementById("address");
  const datalist = document.getElementById("address-suggestions");

  const search = async () => {
    if (!input.value.length) {
      return;
    }

    const data = await location
      .searchPlaceIndexForSuggestions({
        IndexName: "Index",
        FilterBBox: box,
        MaxResults: 5,
        Text: input.value,
      })
      .promise();

    const options = data.Results.map(d => d.Text);
    const children = Array();
    for (const option of options) {
      const o = document.createElement("option");
      o.value = option;
      o.textContent = option;
      children.push(o);
    };
    datalist.replaceChildren(...children);
  };

  if ("onsearch" in input) {
    input.onsearch = search;
  } else {
    input.oninput = debounce(search);
  }

  let marker;
  input.onchange = async () => {
    console.log("here");
    for (let i = 0; i < datalist.childElementCount; i++) {
      const option = datalist.children[i];
      if (option.textContent === input.value) {

        const res = await location
          .searchPlaceIndexForText({
            IndexName: "Index",
            FilterBBox: box,
            MaxResults: 1,
            Text: input.value,
          })
          .promise();

        const position = res.Results[0].Place.Geometry.Point;
        if (marker) {
          marker.remove();
        }

        marker = new maplibregl.Marker()
          .setLngLat(position)
          .addTo(map);
        
        map.flyTo({ center : res.Results[0].Place.Geometry.Point });
      }
    }
  }
}