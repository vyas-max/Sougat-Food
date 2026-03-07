import { Component } from '@theme/component';
import { ThemeEvents, VariantUpdateEvent, ZoomMediaSelectedEvent } from '@theme/events';

/**
 * A custom element that renders a media gallery.
 *
 * @typedef {object} Refs
 * @property {import('./zoom-dialog').ZoomDialog} [zoomDialogComponent] - The zoom dialog component.
 * @property {import('./slideshow').Slideshow} [slideshow] - The slideshow component.
 * @property {HTMLElement[]} [media] - The media elements.
 *
 * @extends Component<Refs>
 */
export class MediaGallery extends Component {
  connectedCallback() {
    super.connectedCallback();

    const { signal } = this.#controller;
    const target = this.closest('.shopify-section, dialog');

    target?.addEventListener(ThemeEvents.variantUpdate, this.#handleVariantUpdate, { signal });
    this.refs.zoomDialogComponent?.addEventListener(ThemeEvents.zoomMediaSelected, this.#handleZoomMediaSelected, {
      signal,
    });
  }

  #controller = new AbortController();

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#controller.abort();
  }

  /**
   * Handles a variant update event by navigating to the variant's featured image
   * or replacing the current media gallery with a new one from the server response.
   *
   * @param {VariantUpdateEvent} event - The variant update event.
   */
  #handleVariantUpdate = (event) => {
    const variant = event.detail.resource;

    // Try to navigate the slideshow to the variant's featured media directly
    if (variant?.featured_media) {
      const mediaId = variant.featured_media.id;
      const navigated = this.#navigateToMedia(mediaId);
      if (navigated) return;
    }

    // Fallback: replace the entire gallery from server-rendered HTML
    const source = event.detail.data.html;

    if (!source) return;
    const newMediaGallery = source.querySelector('media-gallery');

    if (!newMediaGallery) return;

    this.replaceWith(newMediaGallery);
  };

  /**
   * Navigates the slideshow to the slide containing the specified media ID.
   *
   * @param {number|string} mediaId - The media ID to navigate to.
   * @returns {boolean} Whether navigation was successful.
   */
  #navigateToMedia(mediaId) {
    const slideshow = this.refs.slideshow;
    if (!slideshow?.refs?.slides) return false;

    const slides = slideshow.refs.slides;

    for (let i = 0; i < slides.length; i++) {
      const mediaEl = slides[i].querySelector(`[data-media-id="${mediaId}"]`);
      if (mediaEl) {
        slideshow.select(i, undefined, { animate: false });
        return true;
      }
    }

    return false;
  }

  /**
   * Handles the 'zoom-media:selected' event.
   * @param {ZoomMediaSelectedEvent} event - The zoom-media:selected event.
   */
  #handleZoomMediaSelected = async (event) => {
    this.slideshow?.select(event.detail.index, undefined, { animate: false });
  };

  /**
   * Zooms the media gallery.
   *
   * @param {number} index - The index of the media to zoom.
   * @param {PointerEvent} event - The pointer event.
   */
  zoom(index, event) {
    this.refs.zoomDialogComponent?.open(index, event);
  }

  get slideshow() {
    return this.refs.slideshow;
  }

  get media() {
    return this.refs.media;
  }

  get presentation() {
    return this.dataset.presentation;
  }
}

if (!customElements.get('media-gallery')) {
  customElements.define('media-gallery', MediaGallery);
}
