<script setup lang="ts">
const localePath = useLocalePath();
const { get } = useApi();
const texts = ref<string[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Références pour le lecteur vidéo
const videoContainer = ref<HTMLElement>();
const videoElement = ref<HTMLVideoElement>();
const isPlaying = ref(false);
const isMuted = ref(true);
const currentTime = ref(0);
const duration = ref(0);
const isFullscreen = ref(false);
const showControls = ref(true);
const controlsTimeout = ref<NodeJS.Timeout>();

const fetchTexts = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        texts.value = await get<string[]>('/api/texts/about_us');
    } catch (e) {
        error.value = "Une erreur est survenue lors du chargement des textes.";
        console.error('Error fetching about us texts:', e);
    } finally {
        isLoading.value = false;
    }
};

// Gestion du lecteur vidéo
const togglePlay = () => {
    if (!videoElement.value) return;

    if (isPlaying.value) {
        videoElement.value.pause();
    } else {
        videoElement.value.play();
    }
};

const toggleMute = () => {
    if (!videoElement.value) return;
    videoElement.value.muted = !videoElement.value.muted;
    isMuted.value = videoElement.value.muted;
};

const toggleFullscreen = () => {
    if (!videoContainer.value) return;

    if (!isFullscreen.value) {
        if (videoContainer.value.requestFullscreen) {
            videoContainer.value.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};

const seekTo = (event: MouseEvent) => {
    if (!videoElement.value || !duration.value) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const seekTime = percent * duration.value;

    videoElement.value.currentTime = seekTime;
    currentTime.value = seekTime;
};

const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const showControlsTemporarily = () => {
    showControls.value = true;

    if (controlsTimeout.value) {
        clearTimeout(controlsTimeout.value);
    }

    controlsTimeout.value = setTimeout(() => {
        if (isPlaying.value) {
            showControls.value = false;
        }
    }, 3000);
};

// Events du lecteur vidéo
const onVideoLoaded = () => {
    if (!videoElement.value) return;
    duration.value = videoElement.value.duration || 0;
    console.log('Video loaded, duration:', duration.value);
};

const onLoadedData = () => {
    if (!videoElement.value) return;
    duration.value = videoElement.value.duration || 0;
    console.log('Video data loaded, duration:', duration.value);
};

const onCanPlay = () => {
    if (!videoElement.value) return;
    duration.value = videoElement.value.duration || 0;
    console.log('Video can play, duration:', duration.value);
};

const onTimeUpdate = () => {
    if (!videoElement.value) return;
    currentTime.value = videoElement.value.currentTime;

    // Mettre à jour la durée si elle n'est pas encore définie
    if (!duration.value && videoElement.value.duration) {
        duration.value = videoElement.value.duration;
    }
};

const onPlay = () => {
    isPlaying.value = true;
    showControlsTemporarily();
};

const onPause = () => {
    isPlaying.value = false;
    showControls.value = true;
};

const onDurationChange = () => {
    if (!videoElement.value) return;
    duration.value = videoElement.value.duration || 0;
    console.log('Duration changed:', duration.value);
};

const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
    fetchTexts();

    // Écouter les changements de fullscreen
    document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    if (controlsTimeout.value) {
        clearTimeout(controlsTimeout.value);
    }
});
</script>

<template>
    <div class="cs-hero-section">
        <div class="container container-1690">
            <div class="row align-items-center">
                <div class="col-xl-6 col-lg-6 order-2 order-lg-1">
                    <div class="hero-content">
                        <h1 class="hero-title">
                            {{ $t('my-hero.title') }}
                            <span class="highlight">{{ $t('my-hero.highlight') }}</span>
                        </h1>

                        <div class="hero-description">
                            <p class="description-text">{{ texts[0] || $t('my-hero.description1') }}</p>
                            <p class="description-text">{{ texts[1] || $t('my-hero.description2') }}</p>
                        </div>

                        <div class="hero-actions">
                            <NuxtLink :to="localePath('services')" class="btn-primary">
                                <span class="btn-content">
                                    <span class="btn-text">{{ $t('constant.our_services') }}</span>
                                    <span class="btn-arrow">
                                        <i class="fa-sharp fa-regular fa-arrow-right"></i>
                                    </span>
                                </span>
                            </NuxtLink>
                            <NuxtLink :to="localePath('contact')" class="btn-secondary">
                                <span class="btn-content">
                                    <span class="btn-text">{{ $t('constant.contact_us') }}</span>
                                    <span class="btn-icon">
                                        <i class="fa-regular fa-phone"></i>
                                    </span>
                                </span>
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <div class="col-xl-6 col-lg-6 order-1 order-lg-2">
                    <div class="hero-media">
                        <div ref="videoContainer" class="video-container" @mousemove="showControlsTemporarily"
                            @mouseleave="isPlaying && (showControls = false)">
                            <video ref="videoElement" class="custom-video" autoplay muted loop playsinline
                                preload="metadata" @loadedmetadata="onVideoLoaded" @loadeddata="onLoadedData"
                                @canplay="onCanPlay" @durationchange="onDurationChange" @timeupdate="onTimeUpdate"
                                @play="onPlay" @pause="onPause" @click="togglePlay">
                                <!-- Remplacez ce chemin par le chemin vers votre vidéo -->
                                <source src="~/assets/videos/Notre_identité_visuelle.mp4" type="video/mp4">
                                <source src="~/assets/videos/Notre_identité_visuelle.webm" type="video/webm">
                                Votre navigateur ne supporte pas la lecture vidéo.
                            </video>

                            <!-- Contrôles personnalisés -->
                            <div class="video-controls" :class="{ 'show': showControls }">
                                <!-- Overlay play/pause central -->
                                <div class="play-overlay" @click="togglePlay">
                                    <div class="play-button" v-if="!isPlaying">
                                        <i class="fa-solid fa-play"></i>
                                    </div>
                                </div>

                                <!-- Barre de contrôles inférieure -->
                                <div class="controls-bar">
                                    <div class="progress-container" @click="seekTo">
                                        <div class="progress-bar">
                                            <div class="progress-fill"
                                                :style="{ width: (duration > 0 ? (currentTime / duration) * 100 : 0) + '%' }">
                                            </div>
                                            <div class="progress-handle"
                                                :style="{ left: (duration > 0 ? (currentTime / duration) * 100 : 0) + '%' }">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="controls-buttons">
                                        <button class="control-btn" @click="togglePlay">
                                            <i :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
                                        </button>

                                        <div class="time-display">
                                            <span>{{ formatTime(currentTime) }}</span>
                                            <span>/</span>
                                            <span>{{ formatTime(duration) }}</span>
                                        </div>

                                        <div class="controls-right">
                                            <button class="control-btn" @click="toggleMute">
                                                <i
                                                    :class="isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"></i>
                                            </button>

                                            <button class="control-btn" @click="toggleFullscreen">
                                                <i
                                                    :class="isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="floating-elements">
                            <div class="floating-card card-1">
                                <div class="card-icon">⚖️</div>
                                <div class="card-text">
                                    <span class="card-title">{{ $t('my-hero.card1.title') }}</span>
                                    <span class="card-subtitle">{{ $t('my-hero.card1.subtitle') }}</span>
                                </div>
                            </div>
                            <div class="floating-card card-2">
                                <div class="card-icon">📊</div>
                                <div class="card-text">
                                    <span class="card-title">{{ $t('my-hero.card2.title') }}</span>
                                    <span class="card-subtitle">{{ $t('my-hero.card2.subtitle') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Decorative elements -->
        <div class="hero-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-dots"></div>
        </div>
    </div>
</template>

<style scoped>
:root {
    --cs-gold-color: #d4b128;
    --cs-brown-color: #3F2E1A;
    --cs-light-brown-color: #E7D7C5;
}

.cs-hero-section {
    position: relative;
    background: #fff;
    overflow: hidden;
    padding: 2rem 0;
}

.hero-content {
    padding: 2rem 0;
    z-index: 2;
    position: relative;
}

.hero-title {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    line-height: 1.2;
    color: var(--cs-brown-color);
    margin-bottom: 2rem;
    font-weight: 700;
    animation: fadeInUp 0.6s ease-out;
}

.highlight {
    color: var(--cs-gold-color);
    font-style: italic;
    position: relative;
}

.highlight::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, var(--cs-gold-color), transparent);
    border-radius: 1px;
}

.hero-description {
    margin-bottom: 2.5rem;
    animation: fadeInUp 0.6s ease-out 0.2s both;
}

.description-text {
    font-size: 1.125rem;
    line-height: 1.7;
    text-align: justify;
    color: var(--cs-text-dark-colors);
    margin-bottom: 1rem;
    max-width: 90%;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    animation: fadeInUp 0.6s ease-out 0.4s both;
}

/* === LECTEUR VIDÉO PERSONNALISÉ === */
.video-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}

.custom-video {
    width: 100%;
    height: 45vw;
    max-height: 450px;
    min-height: 200px;
    display: block;
    object-fit: cover;
    background: var(--cs-light-brown-color);
}

.video-controls {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(transparent 0%,
            transparent 60%,
            rgba(0, 0, 0, 0.7) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.video-controls.show {
    opacity: 1;
    pointer-events: auto;
}

.play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: auto;
}

.play-button {
    width: 80px;
    height: 80px;
    background: rgba(212, 177, 40, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.play-button:hover {
    background: rgba(212, 177, 40, 1);
    transform: scale(1.1);
}

.play-button i {
    color: white;
    font-size: 2rem;
    margin-left: 4px;
}

.controls-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    pointer-events: auto;
}

.progress-container {
    margin-bottom: 1rem;
    cursor: pointer;
    padding: 8px 0;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    position: relative;
    overflow: visible;
}

.progress-bar:hover {
    height: 8px;
    margin-top: -1px;
}

.progress-fill {
    height: 100%;
    background: var(--cs-gold-color);
    transition: width 0.1s ease;
    border-radius: 3px;
    position: relative;
}

.progress-handle {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    background: var(--cs-gold-color);
    border: 2px solid white;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
}

.progress-container:hover .progress-handle {
    opacity: 1;
}

.controls-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.control-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
}

.control-btn:hover {
    background: rgba(212, 177, 40, 0.8);
    transform: scale(1.1);
}

.time-display {
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.controls-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Boutons existants */
.btn-primary,
.btn-secondary {
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 500;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn-primary {
    background: var(--cs-gold-color);
    color: white;
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.3);
}

.btn-primary:hover {
    background: #c4a125;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 177, 40, 0.4);
    color: white;
}

.btn-secondary {
    background: transparent;
    color: var(--cs-brown-color);
    border: 2px solid var(--cs-light-brown-color);
}

.btn-secondary:hover {
    background: var(--cs-light-brown-color);
    border-color: var(--cs-gold-color);
    transform: translateY(-2px);
}

.btn-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-arrow,
.btn-icon {
    transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
    transform: translateX(3px);
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }
}

.hero-media {
    position: relative;
    padding: 2rem 0;
    animation: fadeInRight 0.8s ease-out 0.6s both;
}

.floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.floating-card {
    position: absolute;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid var(--cs-light-brown-color);
    animation: float 3s ease-in-out infinite;
}

.card-1 {
    top: 20%;
    right: -10%;
    animation-delay: 0s;
}

.card-2 {
    bottom: 20%;
    left: -10%;
    animation-delay: 1.5s;
}

.card-icon {
    font-size: 1.5rem;
}

.card-text {
    display: flex;
    flex-direction: column;
}

.card-title {
    font-weight: 600;
    color: var(--cs-brown-color);
    font-size: 0.875rem;
}

.card-subtitle {
    font-size: 0.75rem;
    color: var(--cs-gold-color);
}

/* Media queries */
@media (max-width: 992px) {
    .custom-video {
        height: 56vw;
        max-height: 320px;
    }

    .card-1,
    .card-2 {
        display: none;
    }
}

@media (max-width: 576px) {
    .custom-video {
        height: 60vw;
        max-height: 220px;
    }

    .play-button {
        width: 60px;
        height: 60px;
    }

    .play-button i {
        font-size: 1.5rem;
    }

    .controls-bar {
        padding: 0.75rem;
    }

    .control-btn {
        width: 35px;
        height: 35px;
        font-size: 1rem;
    }
}

/* Mode plein écran */
.video-container:fullscreen .custom-video {
    height: 100vh;
    max-height: none;
}

.video-container:fullscreen {
    max-width: none;
    border-radius: 0;
}
</style>