<script setup>
onMounted(() => {
    // Initialiser Magnific Popup
    if (typeof window !== 'undefined' && window.jQuery) {
        window.jQuery('.popup-video').magnificPopup({
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        })
    }
})
</script>

<template>
    <div class="col-lg-9 col-md-6 mt-40 pb-40">
        <div class="tp-about-bottom-video bg-position ">
            <a class="tp-about-bottom-video-btn popup-video" href="https://www.youtube.com/watch?v=go7QYaQR494">
                <span>
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M13.5 8.86603C14.1667 8.48113 14.1667 7.51887 13.5 7.13397L1.5 0.205772C0.833333 -0.179129 -1.01328e-06 0.301995 -1.01328e-06 1.0718L-1.01328e-06 14.9282C-1.01328e-06 15.698 0.833332 16.1791 1.5 15.7942L13.5 8.86603Z"
                            fill="#d4b128" />
                    </svg>
                </span>
            </a>
        </div>
    </div>

</template>

<style scoped>
.tp-about-bottom-video {
    height: 330px;
    background-image: url(../../assets/img/about/video.jpg);
    background-size: cover;
    /* border-radius: 8px; */
    /* border: 4px solid var(--cs-gold-color); */
    position: relative;
    overflow: hidden;
}

.popup-video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    /* background: var(--cs-gold-color); */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.popup-video:hover {
    background: var(--cs-brown-color);
    transform: translate(-50%, -50%) scale(1.1);
}

.popup-video svg {
    width: 24px;
    height: 24px;
}
</style>