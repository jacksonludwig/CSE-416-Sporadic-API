/**
 * Convert pageNumber and amountPerPage pagination style to mongodb skip and limit sytle.
 *
 * Returns defaults of page 1 and 100 per page if page/amount per page is not given.
 */
const pagesToSkipAndLimit = (page?: number, amountPerPage?: number) => {
  if (!page) page = 1;
  if (!amountPerPage) amountPerPage = 10;

  return { skip: amountPerPage * (page - 1), limit: amountPerPage };
};

export default pagesToSkipAndLimit;
