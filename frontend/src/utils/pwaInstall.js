// PWA Install Prompt Handler
let deferredPrompt

export const initPWAInstall = () => {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallButton()
  })
}

export const showInstallButton = () => {
  const installButton = document.getElementById("install-button")
  if (installButton) {
    installButton.style.display = "block"
    installButton.addEventListener("click", installApp)
  }
}

export const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    deferredPrompt = null
    hideInstallButton()
  }
}

export const hideInstallButton = () => {
  const installButton = document.getElementById("install-button")
  if (installButton) {
    installButton.style.display = "none"
  }
}
