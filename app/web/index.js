var lastPage = "";

function loadDynamicContent(name) {
  return fetch(`pages/${name}.html`)
    .then((response) => {
      if (!response.ok) {
        return Promise.reject();
      }
      return response.text();
    })
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const bodyContent = doc.body.innerHTML;

      document.getElementById("content").innerHTML = bodyContent;
    })
    .then(() => {
      if (lastPage) {
        const oldScript = document.getElementById(lastPage);
        if (oldScript) {
          oldScript.parentNode.removeChild(oldScript);
        }
      }
      const script = document.createElement("script");
      script.src = `pages/${name}.js`;
      script.id = name;
      document.head.appendChild(script);
      script.onload = () => {
        lastPage = name;
        document.dispatchEvent(new Event("subpage-load"));
      };
    })
    .catch((error) => {
      console.error("There was a problem loading dynamic content:", error);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
  loadDynamicContent("home");
});
