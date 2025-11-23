<script setup lang="ts">
const counterElement = ref<HTMLElement | null>(null)
const currentNumber = ref(0)
const duration = 1000 // 1 seconde
const fps = 60

const props = defineProps({
    targetNumber: {
        type: Number,
        required: true
    },
    symbol: {
        type: String,
        default: '+'
    }
})

function animateCounter(element: HTMLElement) {
    const steps = fps * (duration / 1000)
    const increment = props.targetNumber / steps
    let current = 0
    const timer = setInterval(() => {
        current += increment
        if (current >= props.targetNumber) {
            currentNumber.value = props.targetNumber
            clearInterval(timer)
        } else {
            currentNumber.value = Math.floor(current)
        }
    }, 1000 / fps)
}

onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && counterElement.value) {
                animateCounter(counterElement.value)
                observer.unobserve(counterElement.value) // Ne déclenche qu'une seule fois
            }
        })
    }, {
        threshold: 0.5 // Déclenche quand 50% de l'élément est visible
    })

    if (counterElement.value) {
        observer.observe(counterElement.value)
    }
})


</script>

<template>
    <span class="cs-text-white" ref="counterElement">{{ currentNumber }} {{ props.symbol }}</span>
</template>

<style></style>