import React from 'react';

const Announcements = () => {
  return (
    <section className="py-5 bg-white">
      <div className="container">
        <h2 className="display-6 fw-bold text-primary text-center mb-5">Announcements</h2>
        {/* <button className='btn btn-primary float-end'> <i classname="bi bi-plus"/> Add Announcement</button> */}
        <br/><br/><br/>
        <ul className="list-group">
          <li className="list-group-item">
            <h3 className="fs-5 fw-semibold text-primary mb-2">New Job Openings</h3>
            <p className="text-muted mb-0">Posted on April 9, 2025 - Check out the latest vacancies!</p>
          </li>
          <li className="list-group-item">
            <h3 className="fs-5 fw-semibold text-primary mb-2">Office Closure</h3>
            <p className="text-muted mb-0">Posted on April 8, 2025 - Office closed on April 15 for a holiday.</p>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Announcements;