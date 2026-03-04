export const checkToken = () => {
  return localStorage.getItem('token') ? true : false;
};
