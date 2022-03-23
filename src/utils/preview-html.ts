export const createGraphicPreviewHtml = (
  title: string,
  style: string,
  payload: string
): string => `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>html, body { margin: 0; padding: 0; }</style>
  <style>${style}</style>
</head>

<body onload="load()">
  <div id="myId"></div>
  <script src="./bundle.js"></script>
  <script>
    const load = () => {
      const payload = ${payload}
      const urlToFetchData = null
      const urlToFetchAssets = './assets'
      D2VGraphics.runGraphic({ payload, urlToFetchData, urlToFetchAssets  })
    }
  </script>
</body>

</html>
`;
