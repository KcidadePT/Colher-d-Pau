const SITE_URL = 'https://kcidadept.github.io/Colher-d-Pau/';

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.siteUrl = SITE_URL;

  return template
    .evaluate()
    .setTitle("Colher d'Pau")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
