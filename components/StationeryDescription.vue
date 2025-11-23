<script setup lang="ts">
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
};

const onLoadedData = () => {
    if (!videoElement.value) return;
    duration.value = videoElement.value.duration || 0;
};

const onCanPlay = () => {
    if (!videoElement.value) return;
    duration.value = videoElement.value.duration || 0;
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
};

const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
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
    <div class="tp-about-area p-relative fix mt-20">
        <div class="tp-about-bottom-wrap p-relative fix">
            <div class="container-fluid p-0">
                <div class="row align-items-center">
                    <div class="col-lg-12">
                        <div class="tp-success-section-title-wrap text-center mb-50">
                            <span
                                class="tp-section-subtitle fw-500 cs-text-dark fs-4 d-flex align-items-center justify-content-center gap-2 mb-10">
                                <svg width="30" height="30" viewBox="0 0 17 17" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M1.7 10.2C1.2325 10.2 0.832431 10.0334 0.4998 9.7002C0.1666 9.36759 0 8.9675 0 8.5C0 8.0325 0.1666 7.63215 0.4998 7.29895C0.832431 6.96635 1.2325 6.8 1.7 6.8C2.1675 6.8 2.56757 6.96635 2.9002 7.29895C3.2334 7.63215 3.4 8.0325 3.4 8.5C3.4 8.9675 3.2334 9.36759 2.9002 9.7002C2.56757 10.0334 2.1675 10.2 1.7 10.2ZM3.1025 15.045L1.9125 13.855L5.61 10.1575L6.8 11.3475L3.1025 15.045ZM5.6525 6.8L1.955 3.1025L3.145 1.9125L6.8425 5.61L5.6525 6.8ZM8.5 17C8.0325 17 7.63241 16.8337 7.2998 16.5011C6.9666 16.1679 6.8 15.7675 6.8 15.3C6.8 14.8325 6.9666 14.4321 7.2998 14.099C7.63241 13.7663 8.0325 13.6 8.5 13.6C8.9675 13.6 9.36785 13.7663 9.70105 14.099C10.0337 14.4321 10.2 14.8325 10.2 15.3C10.2 15.7675 10.0337 16.1679 9.70105 16.5011C9.36785 16.8337 8.9675 17 8.5 17ZM8.5 3.4C8.0325 3.4 7.63241 3.2334 7.2998 2.9002C6.9666 2.56757 6.8 2.1675 6.8 1.7C6.8 1.2325 6.9666 0.83215 7.2998 0.49895C7.63241 0.166319 8.0325 0 8.5 0C8.9675 0 9.36785 0.166319 9.70105 0.49895C10.0337 0.83215 10.2 1.2325 10.2 1.7C10.2 2.1675 10.0337 2.56757 9.70105 2.9002C9.36785 3.2334 8.9675 3.4 8.5 3.4ZM11.3475 6.8425L10.1575 5.61L13.8975 1.9125L15.0875 3.1025L11.3475 6.8425ZM13.8975 15.045L10.2 11.3475L11.39 10.1575L15.0875 13.855L13.8975 15.045ZM15.3 10.2C14.8325 10.2 14.4321 10.0334 14.099 9.7002C13.7663 9.36759 13.6 8.9675 13.6 8.5C13.6 8.0325 13.7663 7.63215 14.099 7.29895C14.4321 6.96635 14.8325 6.8 15.3 6.8C15.7675 6.8 16.1679 6.96635 16.5011 7.29895C16.8337 7.63215 17 8.0325 17 8.5C17 8.9675 16.8337 9.36759 16.5011 9.7002C16.1679 10.0334 15.7675 10.2 15.3 10.2Z"
                                        fill="#d4b128" />
                                </svg>
                            </span>
                            <h2 class="mb-25 fs-sm-40 wow img-custom-anim-right cs-text-gold" data-wow-duration="1.5s"
                                data-wow-delay="0.2s">
                                {{ $t('stationery.title') }}
                                <span>{{ $t('stationery.title_span') }}</span>
                            </h2>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="row">
                            <div class="col-xl-6 col-lg-6 mx-auto">
                                <div class="hero-media">
                                    <div 
                                        ref="videoContainer" 
                                        class="video-container"
                                        @mousemove="showControlsTemporarily"
                                        @mouseleave="isPlaying && (showControls = false)"
                                    >
                                        <video
                                            ref="videoElement"
                                            class="custom-video"
                                            autoplay
                                            muted
                                            loop
                                            playsinline
                                            preload="metadata"
                                            @loadedmetadata="onVideoLoaded"
                                            @loadeddata="onLoadedData"
                                            @canplay="onCanPlay"
                                            @durationchange="onDurationChange"
                                            @timeupdate="onTimeUpdate"
                                            @play="onPlay"
                                            @pause="onPause"
                                            @click="togglePlay"
                                        >
                                            <!-- Remplacez ces chemins par vos vidéos -->
                                            <source src="~/assets/videos/2024.mp4" type="video/mp4">
                                            <source src="~/assets/videos/2024.webm" type="video/webm">
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
                                                        <div 
                                                            class="progress-fill" 
                                                            :style="{ width: (duration > 0 ? (currentTime / duration) * 100 : 0) + '%' }"
                                                        ></div>
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
                                                            <i :class="isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"></i>
                                                        </button>

                                                        <button class="control-btn" @click="toggleFullscreen">
                                                            <i :class="isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-12">
                        <div class="content-section">
                            <div class="row">
                                <div class="col-xl-6 content-block">
                                    <h3>{{ $t('stationery.blocks.organization.title') }}</h3>
                                    <p>{{ $t('stationery.blocks.organization.description') }}</p>
                                </div>

                                <div class="col-xl-6 content-block">
                                    <h3>{{ $t('stationery.blocks.ohada.title') }}</h3>
                                    <p>{{ $t('stationery.blocks.ohada.description') }}</p>
                                </div>

                                <div class="col-xl-6 content-block">
                                    <h3>{{ $t('stationery.blocks.strategy.title') }}</h3>
                                    <p>{{ $t('stationery.blocks.strategy.description') }}</p>
                                </div>

                                <div class="col-xl-6 content-block">
                                    <h3>{{ $t('stationery.blocks.legal.title') }}</h3>
                                    <p>{{ $t('stationery.blocks.legal.description') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
:root {
    --cs-gold-color: #d4b128;
    --cs-brown-color: #3F2E1A;
    --cs-light-brown-color: #E7D7C5;
}

.content-section {
    padding: 3rem;
    border-radius: 8px;
}

.title {
    color: var(--cs-brown-color);
    font-size: 2.5rem;
    margin-bottom: 2rem;
    font-weight: 600;
}

.title span {
    color: var(--cs-gold-color);
    font-style: italic;
    font-weight: 400;
}

.paragraph-section {
    display: flex;
    gap: 2rem;
}

.content-block {
    padding: 1.5rem;
    background: white;
    border-left: 4px solid var(--cs-gold-color);
    transition: transform 0.3s ease;
}

.content-block:hover {
    transform: translateX(10px);
    background-color: var(--cs-light-brown-color);
}

.content-block h3 {
    color: var(--cs-gold-color);
    font-family: var(--cs-family-montserrat);
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    font-weight: 500;
}

.content-block p {
    color: var(--cs-bg-dark-color);
    font-family: var(--cs-family-poppins);
    text-align: justify;
    line-height: 1.6;
    margin: 0;
}

/* === LECTEUR VIDÉO PERSONNALISÉ === */
.hero-media {
    position: relative;
    padding: 2rem 0;
    animation: fadeInRight 0.8s ease-out 0.6s both;
}

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
    background: linear-gradient(
        transparent 0%, 
        transparent 60%, 
        rgba(0, 0, 0, 0.7) 100%
    );
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

/* Animations */
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

/* Media queries */
@media (max-width: 992px) {
    .custom-video {
        height: 56vw;
        max-height: 320px;
    }
}

@media (max-width: 768px) {
    .content-section {
        padding: 1.5rem;
    }

    .title {
        font-size: 2rem;
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