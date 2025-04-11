import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const Hero = () => {
  return (
    <div>
    {/* Hero Section */}
    <section className="bg-primary text-white py-5 text-center" style={{ background: 'linear-gradient(to right, #0d6efd, #3b82f6)' }}>
      <div className="container">
        <h1 className="display-4 fw-bold mb-4">Human Resource Management Office</h1>
        <p className="lead">City Government of Davao</p>
      </div>
    </section>

    <div className="hero-carousel-wrapper">
      {/* Fullscreen Carousel Section */}
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active" aria-label="Training Session">
            <div
              className="carousel-image"
              style={{ backgroundImage: `url(/assets/sunstar_import_uploads_images_2021_09_16_311710.jpg)` }}
            ></div>
            <div className="carousel-caption d-block">
              <h5>Training Session</h5>
              <p>Empowering our employees.</p>
            </div>
          </div>
          <div className="carousel-item" aria-label="HRMO Office">
            <div
              className="carousel-image"
              style={{ backgroundImage: `url(/assets/20190929-IMG_1461-min-scaled.jpg)` }}
            ></div>
            <div className="carousel-caption d-block">
              <h5>HRMO Office</h5>
              <p>Welcome to our headquarters.</p>
            </div>
          </div>
          <div className="carousel-item" aria-label="Training Session">
            <div
              className="carousel-image"
              style={{ backgroundImage: `url(/assets/JobOrder-7-min-scaled.jpg)` }}
            ></div>
            <div className="carousel-caption d-block">
              <h5>Training Session</h5>
              <p>Empowering our employees.</p>
            </div>
          </div>
          <div className="carousel-item" aria-label="Training Session">
            <div
              className="carousel-image"
              style={{ backgroundImage: `url(/assets/plantilla-6-1-min-scaled.jpg)` }}
            ></div>
            <div className="carousel-caption d-block">
              <h5>Training Session</h5>
              <p>Empowering our employees.</p>
            </div>
          </div>
          <div className="carousel-item" aria-label="Training Session">
            <div
              className="carousel-image"
              style={{ backgroundImage: `url(/assets/20190929-IMG_1461-min-scaled.jpg)` }}
            ></div>
            <div className="carousel-caption d-block">
              <h5>Training Session</h5>
              <p>Empowering our employees.</p>
            </div>
          </div>
        </div>
        {/* Carousel Controls */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="3"
            aria-label="Slide 4"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="4"
            aria-label="Slide 5"
          ></button>
        </div>
      </div>

      {/* Overlay Hero Text */}
      
      </div>

      {/* Inline CSS for Fullscreen Carousel and Overlay */}
      <style jsx>{`
        .hero-carousel-wrapper {
          position: relative;
          width: 100vw; /* Full viewport width */
          height: 80vh; /* Fixed height of 80% viewport height */
          overflow: hidden;
        }
        .hero-carousel-wrapper .carousel,
        .hero-carousel-wrapper .carousel-inner,
        .hero-carousel-wrapper .carousel-item {
          width: 100vw; /* Full viewport width */
          height: 80vh; /* Fixed height */
          margin: 0;
          padding: 0;
        }
        /* Use background-image to stretch width while maintaining aspect ratio */
        .carousel-image {
          width: 100vw;
          height: 80vh;
          background-size: 100% auto; /* Stretch width, maintain aspect ratio for height */
          background-position: center;
          background-repeat: no-repeat;
        }
        /* Overlay for hero text */
        .hero-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          background: rgba(0, 0, 0, 0.4); /* Semi-transparent background for readability */
          padding: 20px;
          z-index: 10;
        }
        .hero-overlay h1,
        .hero-overlay p {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Shadow for better contrast */
        }
      `}</style>
    </div>
  );
};

export default Hero;