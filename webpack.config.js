module.exports = function (options) {
  return {
    ...options,
    watch: true,
    watchOptions: {
      ignored: ['./web/**/*'],
    },
  };
};
