import { Component } from "@theme/component";

/**
 * Announcement banner custom element that allows fading between content.
 * Based on the Slideshow component.
 *
 * @typedef {object} Refs
 * @property {HTMLElement} slideshowContainer
 * @property {HTMLElement[]} [slides]
 * @property {HTMLButtonElement} [previous]
 * @property {HTMLButtonElement} [next]
 *
 * @extends {Component<Refs>}
 */
export class AnnouncementBar extends Component {
  #current = 0;

  /**
   * The interval ID for automatic playback.
   * @type {number|undefined}
   */
  #interval = undefined;
  #mediaQuery = window.matchMedia("(min-width: 500px)");

  connectedCallback() {
    super.connectedCallback();

    this.#mediaQuery.addEventListener("change", this.#handleMediaChange);

    this.#handleMediaChange(this.#mediaQuery);
  }

  disconnectedCallback() {
    this.#mediaQuery.removeEventListener("change", this.#handleMediaChange);
    this.suspend();
  }

  #handleMediaChange = (e) => {
    if (e.matches) {
      this.#disable();
    } else {
      this.#enable();
    }
  };

  #enable() {
    this.addEventListener("mouseenter", this.suspend);
    this.addEventListener("mouseleave", this.resume);
    document.addEventListener("visibilitychange", this.#handleVisibilityChange);
    this.play();
  }

  #disable() {
    this.suspend();
    this.removeEventListener("mouseenter", this.suspend);
    this.removeEventListener("mouseleave", this.resume);
    document.removeEventListener(
      "visibilitychange",
      this.#handleVisibilityChange,
    );

    this.refs.slides?.forEach((slide) => {
      console.log(slide);
      slide.setAttribute("aria-hidden", "false");
    });
  }

  next() {
    this.current += 1;
  }

  previous() {
    this.current -= 1;
  }

  /**
   * Starts automatic slide playback.
   * @param {number} [interval] - The time interval in seconds between slides.
   */
  play(interval = this.autoplayInterval) {
    if (!this.autoplay) return;

    this.paused = false;

    this.#interval = setInterval(() => {
      if (this.matches(":hover") || document.hidden) return;

      this.next();
    }, interval);
  }

  /**
   * Pauses automatic slide playback.
   */
  pause() {
    this.paused = true;
    this.suspend();
  }

  get paused() {
    return this.hasAttribute("paused");
  }

  set paused(paused) {
    this.toggleAttribute("paused", paused);
  }

  /**
   * Suspends automatic slide playback.
   */
  suspend() {
    clearInterval(this.#interval);
    this.#interval = undefined;
  }

  /**
   * Resumes automatic slide playback if autoplay is enabled.
   */
  resume() {
    if (!this.autoplay || this.paused) return;

    this.pause();
    this.play();
  }

  get autoplay() {
    return Boolean(this.autoplayInterval);
  }

  get autoplayInterval() {
    const interval = this.getAttribute("autoplay");
    const value = parseInt(`${interval}`, 10);

    if (Number.isNaN(value)) return undefined;

    return value * 1000;
  }

  get current() {
    return this.#current;
  }

  set current(current) {
    this.#current = current;

    let relativeIndex = current % (this.refs.slides ?? []).length;
    if (relativeIndex < 0) {
      relativeIndex += (this.refs.slides ?? []).length;
    }

    this.refs.slides?.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", `${index !== relativeIndex}`);
    });
  }

  #handleVisibilityChange = () =>
    document.hidden ? this.pause() : this.resume();
}

if (!customElements.get("announcement-bar-component")) {
  customElements.define("announcement-bar-component", AnnouncementBar);
}
