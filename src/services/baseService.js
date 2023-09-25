const postMessage = (data) => {
  try {
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
  } catch (error) {}
};

const baseService = {
  postMessage,
};

export default baseService;
