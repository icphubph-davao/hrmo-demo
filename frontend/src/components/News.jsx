import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/backend';
import { canisterId } from 'declarations/backend/index.js';
import { Plus, BoxArrowRight, BoxArrowInRight, Eye, Pencil, Trash, X, Check } from 'react-bootstrap-icons';

const network = process.env.DFX_NETWORK || 'local';
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app'
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943';
const host = network === 'local' ? 'http://localhost:4943' : 'https://ic0.app';

const News = () => {
  const [show, setShow] = useState(false);
  const [isUpdate, setUpdate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileTransferProgress, setFileTransferProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    image: null,
    title: '',
    content: '',
    additionalContent: '',
    remarks: '',
    name: '',
    url: null
  });

  const handleClose = () => {
    setShow(false);
    setUpdate(false);
    setFormData({
      image: null,
      title: '',
      content: '',
      additionalContent: '',
      remarks: '',
      name: '',
      url: null
    });
    setErrorMessage('');
  };

  const handleShow = () => setShow(true);

  const handleShowAction = (action, file = null) => {
    if (action === 'update' && file) {
      setUpdate(true);
      setFormData({
        image: null,
        title: file.title,
        content: file.content,
        additionalContent: file.additionalContent,
        remarks: file.remarks,
        name: file.name,
        url: file.url
      });
      handleShow();
    } else if (action === 'view' && file) {
      setUpdate(false);
      setFormData({
        image: null,
        title: file.title,
        content: file.content,
        additionalContent: file.additionalContent,
        remarks: file.remarks,
        name: file.name,
        url: file.url
      });
      handleShow();
    } else {
      setUpdate(false);
      handleShow();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      image: file
    }));
  };

  useEffect(() => {
    async function initializeActor() {
      try {
        setErrorMessage('');
        setLoading(true);
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const actor = createActor(canisterId, {
          agentOptions: {
            identity,
            host,
            fetchOptions: network === 'local' ? { fetch: window.fetch.bind(window) } : undefined,
            verifyQuerySignatures: network !== 'local' // Disable signature verification for local
          }
        });
        const isAuthenticated = await authClient.isAuthenticated();

        console.log('Actor initialized:', actor);
        setActor(actor);
        setAuthClient(authClient);
        setIsAuthenticated(isAuthenticated);
      } catch (error) {
        console.error('Failed to initialize actor:', error);
        setErrorMessage('Failed to initialize application. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    initializeActor();
  }, []);

  useEffect(() => {
    if (actor) {
      loadFiles(); // Load files as soon as actor is available, regardless of auth status
    }
    return () => {
      files.forEach((file) => {
        if (file.url) URL.revokeObjectURL(file.url);
      });
    };
  }, [actor]);

  async function login() {
    if (!authClient) {
      setErrorMessage('Authentication client not initialized.');
      return;
    }
    try {
      setLoading(true);
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          await updateActor();
        }
      });
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    if (!authClient) {
      setErrorMessage('Authentication client not initialized.');
      return;
    }
    try {
      setLoading(true);
      await authClient.logout();
      await updateActor();
    } catch (error) {
      console.error('Logout failed:', error);
      setErrorMessage('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function updateActor() {
    try {
      setLoading(true);
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const actor = createActor(canisterId, {
        agentOptions: {
          identity,
          host,
          fetchOptions: network === 'local' ? { fetch: window.fetch.bind(window) } : undefined,
          verifyQuerySignatures: network !== 'local'
        }
      });
      const isAuthenticated = await authClient.isAuthenticated();

      console.log('Actor updated:', actor);
      setActor(actor);
      setAuthClient(authClient);
      setIsAuthenticated(isAuthenticated);
    } catch (error) {
      console.error('Failed to update actor:', error);
      setErrorMessage('Failed to update authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadFiles() {
    if (!actor) {
      console.warn('Actor not initialized yet.');
      setErrorMessage('Application not ready. Please try again.');
      return;
    }
    try {
      setLoading(true);
      const fileList = await actor.getFiles();
      console.log('Fetched files:', fileList);
      const filesWithUrls = await Promise.all(
        fileList.map(async (file) => {
          try {
            const totalChunks = Number(await actor.getTotalChunks(file.name));
            console.log(`File ${file.name} has ${totalChunks} chunks`);
            if (totalChunks === 0) return { ...file, url: null };
            let chunks = [];
            for (let i = 0; i < totalChunks; i++) {
              const chunkBlob = await actor.getFileChunk(file.name, BigInt(i));
              if (chunkBlob) {
                chunks.push(chunkBlob[0]);
              } else {
                throw new Error(`Failed to retrieve chunk ${i} for ${file.name}`);
              }
            }
            const blob = new Blob(chunks, { type: file.fileType });
            const url = URL.createObjectURL(blob);
            return { ...file, url };
          } catch (error) {
            console.error(`Failed to load image for ${file.name}:`, error);
            return { ...file, url: null };
          }
        })
      );
      console.log('Files with URLs:', filesWithUrls);
      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Failed to load files:', error);
      setErrorMessage(`Failed to load files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file, title, content, additionalContent, remarks, isUpdate = false, oldFileName = null) {
    if (!actor) {
      setErrorMessage('Actor not initialized.');
      return;
    }
    if (!isAuthenticated) {
      setErrorMessage('You must be authenticated to upload files.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    console.log('Starting file upload:', { file, title, content, additionalContent, remarks, isUpdate, oldFileName });

    const fileExtension = file ? file.name.split('.').pop() || 'png' : (oldFileName ? oldFileName.split('.').pop() : 'png');
    const fileName = `${title.replace(/\s+/g, '_').toLowerCase()}.${fileExtension}`;
    console.log('Generated fileName:', fileName);

    if (!isUpdate) {
      const exists = await actor.checkFileExists(fileName);
      console.log('Check file exists:', exists);
      if (exists) {
        setErrorMessage(`File "${fileName}" already exists. Please choose a different title.`);
        setLoading(false);
        return;
      }
    }

    if (!file && !isUpdate) {
      setErrorMessage('Please select a file to upload.');
      setLoading(false);
      return;
    }

    if (isUpdate && !file && oldFileName) {
      try {
        console.log('Updating metadata only for:', oldFileName);
        const existingFile = files.find(f => f.name === oldFileName);
        if (!existingFile) throw new Error('Existing file not found in local state.');
        
        if (oldFileName !== fileName) {
          console.log('File name changed, deleting old file:', oldFileName);
          await actor.deleteFile(oldFileName);
          const totalChunks = Number(await actor.getTotalChunks(oldFileName));
          for (let i = 0; i < totalChunks; i++) {
            const chunkBlob = await actor.getFileChunk(oldFileName, BigInt(i));
            if (chunkBlob) {
              console.log(`Re-uploading chunk ${i} for new name: ${fileName}`);
              await actor.uploadFileChunk(
                fileName,
                title,
                content,
                additionalContent,
                remarks,
                chunkBlob[0],
                BigInt(i),
                existingFile.fileType
              );
            }
          }
        } else {
          console.log('Updating metadata with dummy chunk for:', fileName);
          await actor.uploadFileChunk(
            fileName,
            title,
            content,
            additionalContent,
            remarks,
            new Uint8Array([]),
            BigInt(0),
            existingFile.fileType
          );
        }
        await loadFiles();
      } catch (error) {
        console.error('Metadata update failed:', error);
        setErrorMessage(`Failed to update ${fileName}: ${error.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isUpdate && oldFileName && oldFileName !== fileName) {
      try {
        console.log('Deleting old file due to name change:', oldFileName);
        await actor.deleteFile(oldFileName);
      } catch (error) {
        console.error('Failed to delete old file:', error);
        setErrorMessage(`Failed to delete old file ${oldFileName}: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    if (!file) {
      setErrorMessage('No file selected for upload.');
      setLoading(false);
      return;
    }

    setFileTransferProgress({
      mode: 'Uploading',
      fileName: fileName,
      progress: 0
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = new Uint8Array(e.target.result);
      const chunkSize = 1024 * 1024;
      const totalChunks = Math.ceil(fileContent.length / chunkSize);
      console.log(`Uploading ${totalChunks} chunks for ${fileName}`);

      try {
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, fileContent.length);
          const chunk = fileContent.slice(start, end);

          console.log(`Uploading chunk ${i + 1}/${totalChunks}`);
          await actor.uploadFileChunk(
            fileName,
            title,
            content,
            additionalContent,
            remarks,
            chunk,
            BigInt(i),
            file.type
          );
          setFileTransferProgress((prev) => ({
            ...prev,
            progress: Math.floor(((i + 1) / totalChunks) * 100)
          }));
        }
        console.log('Upload complete, reloading files');
        await loadFiles();
      } catch (error) {
        console.error('Upload failed:', error);
        setErrorMessage(`Failed to upload ${fileName}: ${error.message}`);
      } finally {
        setFileTransferProgress(null);
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleFileDownload(name) {
    if (!actor) {
      setErrorMessage('Actor not initialized.');
      return;
    }
    setFileTransferProgress({
      mode: 'Downloading',
      fileName: name,
      progress: 0
    });
    try {
      setLoading(true);
      const totalChunks = Number(await actor.getTotalChunks(name));
      const fileType = (await actor.getFileType(name))?.[0] || 'application/octet-stream';
      let chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunkBlob = await actor.getFileChunk(name, BigInt(i));
        if (chunkBlob) {
          chunks.push(chunkBlob[0]);
        } else {
          throw new Error(`Failed to retrieve chunk ${i}`);
        }

        setFileTransferProgress((prev) => ({
          ...prev,
          progress: Math.floor(((i + 1) / totalChunks) * 100)
        }));
      }

      const data = new Blob(chunks, { type: fileType });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setErrorMessage(`Failed to download ${name}: ${error.message}`);
    } finally {
      setFileTransferProgress(null);
      setLoading(false);
    }
  }

  async function handleFileDelete(name) {
    if (!actor) {
      setErrorMessage('Actor not initialized.');
      return;
    }
    if (!isAuthenticated) {
      setErrorMessage('You must be authenticated to delete files.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        setLoading(true);
        const success = await actor.deleteFile(name);
        if (success) {
          await loadFiles();
        } else {
          setErrorMessage('Failed to delete file');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        setErrorMessage(`Failed to delete ${name}: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actor) {
      setErrorMessage('Application not ready. Please try again.');
      return;
    }
    if (!isAuthenticated) {
      setErrorMessage('You must be authenticated to submit news.');
      return;
    }
    console.log('Form submitted:', formData);
    try {
      setLoading(true);
      await handleFileUpload(
        formData.image,
        formData.title,
        formData.content,
        formData.additionalContent,
        formData.remarks,
        isUpdate,
        isUpdate ? formData.name : null
      );
      handleClose();
    } catch (error) {
      console.error('Form submission failed:', error);
      setErrorMessage('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <style>
        {`
          .btn {
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
          }
          .btn svg {
            margin-right: 0.5rem;
          }
          .btn-group .btn {
            min-width: 100px;
          }
        `}
      </style>
      <section className="container">
        <div className="d-flex justify-content-end">
          {isAuthenticated ? (
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleShow();
                }}
                disabled={loading}
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  <>
                    <Plus /> Add news
                  </>
                )}
              </button>
              <button
                onClick={logout}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  <>
                    <BoxArrowRight /> Logout
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : (
                <>
                  <BoxArrowInRight /> Login with Internet Identity
                </>
              )}
            </button>
          )}
        </div>
      </section>

      <div className="album py-5 bg-body-tertiary">
        <div className="container">
          <br />
          <br />
          {loading && !files.length ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center">
              <p>No news available.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
              {files.map((file, index) => (
                <div className="col" key={index}>
                  <div className="card shadow-sm">
                    <img
                      src={file.url || 'https://via.placeholder.com/225x225.png?text=No+Image'}
                      className="card-img-top"
                      alt={file.title}
                      style={{ height: '225px', objectFit: 'cover' }}
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/225x225.png?text=Error')}
                    />
                    <div className="card-body">
                      <p className="card-text">{file.content}</p>
                      {file.additionalContent && (
                        <p className="card-text text-muted">{file.additionalContent}</p>
                      )}
                    </div>
                    <div className="card-footer text-muted">
                      {file.remarks ? file.remarks : 'No remarks'}
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              handleShowAction('view', file);
                            }}
                            disabled={loading}
                          >
                            {loading ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              <>
                                <Eye /> Read More
                              </>
                            )}
                          </button>
                          {isAuthenticated && (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  handleShowAction('update', file);
                                }}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Spinner as="span" animation="border" size="sm" />
                                ) : (
                                  <>
                                    <Pencil /> Edit
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleFileDelete(file.name)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Spinner as="span" animation="border" size="sm" />
                                ) : (
                                  <>
                                    <Trash /> Delete
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                        <small className="text-body-secondary">9 mins</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{isUpdate ? 'Update News' : formData.url ? 'View News' : 'Add News'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {formData.url && (
              <div className="mb-3">
                <img
                  src={formData.url}
                  alt={formData.title}
                  style={{ maxWidth: '100%', height: 'auto', marginBottom: '15px' }}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/225x225.png?text=No+Image')}
                />
              </div>
            )}
            {isAuthenticated && !formData.url && (
              <Form.Group className="mb-3" controlId="formImage">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter title"
                required={isAuthenticated && (!formData.url || isUpdate)}
                disabled={(!isAuthenticated || (formData.url && !isUpdate)) || loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter content"
                required={isAuthenticated && (!formData.url || isUpdate)}
                disabled={(!isAuthenticated || (formData.url && !isUpdate)) || loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAdditionalContent">
              <Form.Label>Additional Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="additionalContent"
                value={formData.additionalContent}
                onChange={handleInputChange}
                placeholder="Enter additional content"
                disabled={(!isAuthenticated || (formData.url && !isUpdate)) || loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRemarks">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Enter remarks"
                disabled={(!isAuthenticated || (formData.url && !isUpdate)) || loading}
              />
            </Form.Group>

            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            {fileTransferProgress && (
              <div className="progress mb-3">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${fileTransferProgress.progress}%` }}
                  aria-valuenow={fileTransferProgress.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {fileTransferProgress.mode} {fileTransferProgress.progress}%
                </div>
              </div>
            )}

            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  <>
                    <X /> Close
                  </>
                )}
              </Button>
              {isAuthenticated && isUpdate && (
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    <>
                      <Check /> Update
                    </>
                  )}
                </Button>
              )}
              {isAuthenticated && !isUpdate && !formData.url && (
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    <>
                      <Check /> Submit
                    </>
                  )}
                </Button>
              )}
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default News;