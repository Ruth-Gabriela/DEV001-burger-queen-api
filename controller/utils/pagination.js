/* eslint-disable radix */
const pagination = (url, page, limit, total) => {
  // limit-> numero de items por pagina, page -> numero de pag solicitada por el usuario
  const prevPage = page > 1 ? ((parseInt(page, 0)) - 1) : 1;
  const lastPage = Math.ceil(total / limit); // numero de páginas
  const nextPage = limit * page < total ? (parseInt(page, 0) + 1) : lastPage;

  const link = {
    first: `<${url}?limit=${limit}&page=1>; rel="first"`,
    prev: `<${url}?limit=${limit}&page=${prevPage}>; rel="prev"`,
    next: `<${url}?limit=${limit}&page=${nextPage}>; rel="next"`,
    last: `<${url}?limit=${limit}&page=${lastPage}>; rel="last"`,
  };

  return `${link.first}, ${link.prev}, ${link.next}, ${link.last}`;
};

module.exports = pagination;
