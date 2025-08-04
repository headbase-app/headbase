
export async function getThirdPartyPlugin() {
  // javascript code as string (in future loaded from OPFS)
  const content = `
class ThirdPartyPlugin {
  constructor(container) {
    this.container = container
  }

  init() {
    const header = document.createElement("div");
    header.innerText = "Third Party!!";
    this.container.appendChild(header);
  }

  teardown() {
    this.container.innerHTML = "";
  }
}

export default {
  meta: {
    name: "Example Third Party",
    version: 1.0
  },
  plugin: ThirdPartyPlugin
}
`;

  const moduleUri = 'data:text/javascript;base64,' + btoa(content);
  const module = await import(/* @vite-ignore */moduleUri)
  return module.default
}
