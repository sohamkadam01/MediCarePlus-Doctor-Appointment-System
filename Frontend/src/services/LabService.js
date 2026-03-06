import api from './api';

const LabService = {
  getLabs() {
    return api.get('/labs', false);
  },
  getLab(id) {
    return api.get(`/labs/${id}`, false);
  },
};

export default LabService;
