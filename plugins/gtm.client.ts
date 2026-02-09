// Google Tag Manager - noscript fallback
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-WMX8QZBN'
    iframe.height = '0'
    iframe.width = '0'
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'
    noscript.appendChild(iframe)
    document.body.insertBefore(noscript, document.body.firstChild)
  }
})
