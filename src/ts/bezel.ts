class Bezel {
    container: any;
    constructor(container) {
        this.container = container;

        this.container.addEventListener('animationend', () => {
            this.container.classList.remove('CloudPlayback-bezel-transition');
        });
    }

    switch(icon) {
        this.container.innerHTML = icon;
        this.container.classList.add('CloudPlayback-bezel-transition');
    }
}

export default Bezel;
