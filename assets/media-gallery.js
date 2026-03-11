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
   * Handles a variant update event by navigating to the variant's featured media.
   *
   * @param {VariantUpdateEvent} event - The variant update event.
   */
  #handleVariantUpdate = (event) => {
    const { resource } = event.detail;
    
    if (!resource || !resource.featured_media) return;
    
    const mediaId = String(resource.featured_media.id);
    const mediaItems = this.querySelectorAll('[data-media-id]');
    
    for (let i = 0; i < mediaItems.length; i++) {
      if (mediaItems[i].getAttribute('data-media-id') === mediaId) {
        if (this.slideshow && typeof this.slideshow.select === 'function') {
          this.slideshow.select(i, undefined, { animate: false });
        }
        
        // Update thumbnails if present
        const thumbs = this.querySelectorAll('.slideshow-controls__thumbnail');
        thumbs.forEach((thumb, idx) => {
          thumb.setAttribute('aria-selected', idx === i ? 'true' : 'false');
        });
        break;
      }
    }
  };

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
