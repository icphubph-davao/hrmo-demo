import React from 'react';
const Services = () => {
  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="display-6 fw-bold text-primary text-center mb-5">Our Services</h2>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title fs-4 fw-semibold text-primary mb-3">Recruitment</h3>
                <p className="card-text text-muted">Explore job opportunities and apply online.</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title fs-4 fw-semibold text-primary mb-3">Training</h3>
                <p className="card-text text-muted">Access training programs for career growth.</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="card-title fs-4 fw-semibold text-primary mb-3">Employee Support</h3>
                <p className="card-text text-muted">Get assistance with HR-related inquiries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;