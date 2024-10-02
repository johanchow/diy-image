let ApiHost: string;

if (process.env.REACT_APP_BUILD_ENV === 'prod') {
  ApiHost = "//clothing-try-on-123543-7-1330028415.sh.run.tcloudbase.com";
} else {
  ApiHost = "//localhost:5000";
}

export {
  ApiHost,
};
