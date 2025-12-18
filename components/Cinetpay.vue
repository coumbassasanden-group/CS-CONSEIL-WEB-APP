<template>
  <div class="sdk">
    <!-- Composant de paiement Cinetpay -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

// ✅ Vérifier que window.CinetPay existe
declare global {
  interface Window {
    CinetPay: any
  }
}

const runtimeConfig = useRuntimeConfig()
const apikey = (runtimeConfig as any)?.cinetpay?.apikey
const site_id = (runtimeConfig as any)?.cinetpay?.site_id
const notify_url = (runtimeConfig as any)?.cinetpay?.notify_url
const mode = (runtimeConfig as any)?.cinetpay?.mode

// ✅ FIXE: "structure" pas "struncture", "required" pas "require"
const props = defineProps({
  structure: { type: String, required: true },
  userName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  service: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  transactionId: { type: String, required: true }
})


const isCinetPayLoaded = ref(false)
const isLoading = ref(false)

// ✅ Charger le script Cinetpay
const loadCinetPayScript = () => {
  return new Promise<void>((resolve, reject) => {
    // Vérifier si le script est déjà chargé
    if (window.CinetPay) {
      console.log('✅ CinetPay est déjà chargé')
      resolve()
      return
    }

    console.log('📥 Chargement du script Cinetpay...')
    const script = document.createElement('script')
    script.src = 'https://cdn.cinetpay.com/seamless/main.js'
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log('✅ Script Cinetpay chargé avec succès')
      resolve()
    }

    script.onerror = () => {
      console.error('❌ Erreur: Impossible de charger le script Cinetpay')
      reject(new Error('Failed to load CinetPay script'))
    }

    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    await loadCinetPayScript()
    isCinetPayLoaded.value = true
    console.log('✅ Cinetpay prêt à être utilisé')
  } catch (error) {
    console.error('❌ Erreur lors du chargement de Cinetpay:', error)
  }
})

// ✅ Fonction de paiement améliorée
const checkout = async (handlePost?: Function) => {
  console.log('🔄 Tentative d\'ouverture du paiement Cinetpay...')

  // Vérifier que Cinetpay est chargé
  if (!isCinetPayLoaded.value) {
    console.error('❌ CinetPay n\'est pas chargé. Attente...')
    return
  }

  // Vérifier que window.CinetPay existe
  if (typeof window.CinetPay === 'undefined') {
    console.error('❌ window.CinetPay est undefined')
    return
  }

  // Vérifier les paramètres requis
  if (!props.amount || !props.email || !props.phone) {
    console.error('❌ Paramètres manquants:', {
      amount: props.amount,
      email: props.email,
      phone: props.phone
    })
    return
  }

  isLoading.value = true

  try {
    console.log('🔧 Configuration de Cinetpay...')

    // ✅ Utiliser les paramètres de runtime config ou les valeurs par défaut
    window.CinetPay.setConfig({
      apikey: apikey || '2062271806665f3a8d2f4bc8.75775900',
      site_id: site_id || '5873225',
      notify_url: notify_url || 'https://affairez.com/notify.php',
      mode: mode || 'DEVELOPMENT' // ✅ DEVELOPMENT, pas DEVELOPPMENT
    })

    console.log('💳 Ouverture du formulaire de paiement...')

    // ✅ Utiliser le transactionId passé en prop
    console.log('📝 Paramètres de paiement:', {
      transaction_id: props.transactionId,
      amount: props.amount,
      customer_name: props.firstName,
      customer_email: props.email,
      customer_phone_number: props.phone
    })

    // Gérer les erreurs Cinetpay AVANT getCheckout
    window.CinetPay.onError(function (data: any) {
      console.error('❌ Erreur Cinetpay:', data)
      isLoading.value = false
    })

    // Attendre la réponse du paiement AVANT getCheckout
    window.CinetPay.waitResponse(function (data: any) {
      console.log('📊 Réponse Cinetpay reçue:', data)

      if (data.status === 'REFUSED') {
        console.warn('❌ Paiement refusé')
        alert('Votre paiement a échoué. Veuillez réessayer.')
        setTimeout(() => window.location.reload(), 1000)
      } else if (data.status === 'ACCEPTED') {
        console.log('✅ Paiement accepté!')

        // Appeler la fonction de callback si fournie
        if (handlePost && typeof handlePost === 'function') {
          console.log('📤 Appel du callback handlePost...')
          try {
            handlePost()
          } catch (callbackError) {
            console.error('❌ Erreur dans le callback:', callbackError)
          }
        }

        alert('Votre paiement a été effectué avec succès')
        setTimeout(() => window.location.reload(), 1000)
      } else if (data.status === 'PENDING') {
        console.log('⏳ Paiement en attente...')
        alert('Votre paiement est en attente de confirmation')
      }

      isLoading.value = false
    })

    // Maintenant ouvrir le formulaire de paiement
    console.log('🔓 Ouverture du formulaire Cinetpay...')
    window.CinetPay.getCheckout({
      transaction_id: props.transactionId,
      amount: props.amount,
      currency: 'XOF',
      channels: 'ALL',
      description: props.service || 'Paiement',
      customer_name: props.firstName || props.userName,
      customer_surname: props.lastName || '',
      customer_email: props.email,
      customer_phone_number: props.phone,
      customer_address: 'BP 000',
      customer_city: 'Abidjan',
      customer_country: 'CI',
      customer_state: 'CM',
      customer_zip_code: '000'
    })

    console.log('✅ Formulaire de paiement ouvert avec succès')
  } catch (error) {
    console.error('❌ Erreur lors du paiement:', error)
    isLoading.value = false
  }
}

defineExpose({ checkout, isCinetPayLoaded })
</script>

<style scoped>
.sdk {
  display: block;
  /* position: absolute; */
  background-position: center;
  text-align: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
