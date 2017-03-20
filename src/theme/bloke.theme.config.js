import _    from 'lodash';
import path from 'path';

function linkArticle (title) {
  return `/article/${encodeURIComponent(title)}.html`;
}

function linkCategory (categories) {
  return _.map(categories, function (category) {
    return `/category/${encodeURIComponent(category)}.html`;
  });
}

function linkTag (tags) {
  return _.map(tags, function (tag) {
    return `/tag/${encodeURIComponent(tag)}.html`;
  });
}

function packArticle (article) {
  article.tags          = article.tag.split(',');
  article.categories    = article.category.split(',');
  article.link          = linkArticle(article.title);
  article.categoryLinks = linkCategory(article.categories);
  article.tagLinks      = linkTag(article.tags);

  return article;
}

function linkPage (pages, prelink) {
  return _.map(pages, function (page) {
    return path.join(prelink, `/page/${page}.html`);
  });
}

export default {
  root     : path.join(__dirname, '../../'),
  template : 'dist/theme/templates/',
  assets   : ['dist/theme/styles/', 'dist/theme/scripts/'],
  ignore   : [/node_modules/],
  engine   : {
    use  : 'pug',
    test : /\.pug$/,
  },
  renderer: [
    {
      template: './article_list.pug',
      picker ({ articles }, setting) {
        let perPage   = setting.perPage || 10;
        let chunks    = _.chunk(Object.keys(articles), perPage);
        articles      = _.map(articles, packArticle);

        let curPage   = 1;
        let pages     = page(curPage, chunks.length, perPage);
        let pageLinks = linkPage(pages, '/article/');

        return {
          output: './index.html',
          data  : {
            articles : _.pick(articles, chunks[0]),
            page     : {
              perSize   : perPage,
              total     : chunks.length,
              current   : curPage,
              pages     : pages,
              pageLinks : pageLinks,
            },
          },
        };
      },
    },
    /**
     * article list
     * article sort by datetime
     */
    {
      template: './article_list.pug',
      picker ({ articles }, setting) {
        let perPage   = setting.perPage || 10;
        let chunks    = _.chunk(Object.keys(articles), perPage);
        articles      = _.map(articles, packArticle);

        return _.map(chunks, function (chunk, index) {
          let curPage   = index + 1;
          let pages     = page(curPage, chunks.length, perPage);
          let pageLinks = linkPage(pages, '/article/');

          return {
            output : `./article/page/${curPage}.html`,
            data   : {
              articles : _.pick(articles, chunk),
              page     : {
                perSize   : perPage,
                total     : chunks.length,
                current   : curPage,
                pages     : pages,
                pageLinks : pageLinks,
              },
            },
          };
        });
      },
    },
    // /**
    //  * tags detail page to show article list
    //  * article filter by archive
    //  */
    // {
    //   template: './article_list.pug',
    //   picker ({ tags }, setting) {
    //     let pages = _.map(tags, function (articles, name) {
    //       let perPage  = setting.perPage || 10;
    //       let chunks   = _.chunk(articles, perPage);

    //       return _.map(chunks, function (chunk, page) {
    //         return {
    //           output : `./tag/${name}/${page}.html`,
    //           data   : {
    //             articles : chunk,
    //             page     : {
    //               perSize : perPage,
    //               total   : chunks.length,
    //               current : page,
    //             },
    //           },
    //         };
    //       });
    //     });

    //     return _.flattenDeep(pages);
    //   },
    // },
    // /**
    //  * archive detail page to show article list
    //  * article filter by archive
    //  */
    // {
    //   template: './article_list.pug',
    //   picker ({ archives }, setting) {
    //     let pages = _.map(archives, function (articles, name) {
    //       let perPage  = setting.perPage || 10;
    //       let chunks   = _.chunk(articles, perPage);

    //       return _.map(chunks, function (chunk, page) {
    //         return {
    //           output : `./category/${name}/${page}.html`,
    //           data   : {
    //             articles : chunk,
    //             page     : {
    //               perSize : perPage,
    //               total   : chunks.length,
    //               current : page,
    //             },
    //           },
    //         };
    //       });
    //     });

    //     return _.flattenDeep(pages);
    //   },
    // },
    // /**
    //  * author articles page
    //  */
    // {
    //   template: './article_list.pug',
    //   picker ({ authors }, setting) {
    //     let pages = _.map(authors, function (articles, name) {
    //       let perPage  = setting.perPage || 10;
    //       let chunks   = _.chunk(articles, perPage);

    //       return _.map(chunks, function (chunk, page) {
    //         return {
    //           output : `./category/${name}/${page}.html`,
    //           data   : {
    //             articles : chunk,
    //             page     : {
    //               perSize : perPage,
    //               total   : chunks.length,
    //               current : page,
    //             },
    //           },
    //         };
    //       });
    //     });

    //     return _.flattenDeep(pages);
    //   },
    // },
    /**
     * article detail page
     */
    {
      template : './article.pug',
      picker ({ articles }) {
        return _.map(articles, function (article) {
          return {
            output : `./article/${article.title}.html`,
            data   : article,
          };
        });
      },
    },
    // {
    //   template : './tag.pug',
    //   output   : './tag/index.html',
    //   picker   : 'tags',
    // },
    // {
    //   template : './archive.pug',
    //   output   : './archive/index.html',
    //   picker   : 'archives',
    // },
    // {
    //   template : './error.pug',
    //   output   : './error.html',
    // },
  ],
};

function page (current, total, perPage) {
  if (current < 1) {
    current = 1
  }

  if (current > total) {
    current = total
  }

  let pageStart = current - perPage / 2;
  let pageEnd   = current + perPage / 2;

  if (pageStart < 1) {
    pageStart = 1;
    pageEnd += perPage / 2;
  }

  if (pageEnd > total) {
    pageEnd = total;

    if (pageStart > perPage / 2) {
      pageStart -= perPage / 2;
    }
  }

  let pages = new Array(total > 0 ? total : 1)
  .fill(pageStart)
  .map((k, page) => {
    return page + pageStart;
  });

  return pages;
}
