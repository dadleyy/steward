export default function defer() {
  const deferred = { };
  deferred.promise = new Promise((resolve, reject) => Object.assign(deferred, { resolve, reject }));
  return deferred;
}
