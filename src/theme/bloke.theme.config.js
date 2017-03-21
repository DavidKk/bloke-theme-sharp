import _    from 'lodash';
import path from 'path';

function linkArticle (title) {
  return `/article/${title}.html`;
}

function linkCategory (categories) {
  return _.map(categories, function (category) {
    return `/category/${category}/1.html`;
  });
}

function linkTag (tags) {
  return _.map(tags, function (tag) {
    return `/tag/${tag}/1.html`;
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
    /**
     * tags detail page to show article list
     * article filter by archive
     */
    {
      template: './article_list.pug',
      picker ({ tags }, setting) {
        let perPage = setting.perPage || 10;

        let pages = _.map(tags, function (articles, name) {
          let chunks = _.chunk(Object.keys(articles), perPage);
          articles   = _.map(articles, packArticle);

          return _.map(chunks, function (chunk, index) {
            let curPage   = index + 1;
            let pages     = page(curPage, chunks.length, perPage);
            let pageLinks = linkPage(pages, `/tag/${name}/`);

            return {
              output : `./tag/${name}/${curPage}.html`,
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
        });

        return _.flattenDeep(pages);
      },
    },
    /**
     * archive detail page to show article list
     * article filter by archive
     */
    {
      template: './article_list.pug',
      picker ({ categories }, setting) {
        let perPage = setting.perPage || 10;

        let pages = _.map(categories, function (articles, name) {
          let chunks = _.chunk(Object.keys(articles), perPage);
          articles   = _.map(articles, packArticle);

          return _.map(chunks, function (chunk, index) {
            let curPage   = index + 1;
            let pages     = page(curPage, chunks.length, perPage);
            let pageLinks = linkPage(pages, `/category/${name}/`);

            return {
              output : `./category/${name}/${curPage}.html`,
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
        });

        return _.flattenDeep(pages);
      },
    },
    /**
     * article detail page
     */
    {
      template : './article.pug',
      picker ({ articles }) {
        return _.map(articles, function (article, index) {
          let relative = packArticle(article);
          let nextArticle = articles[index +1];
          let prevArticle = articles[index -1];

          if (!_.isEmpty(prevArticle)) {
            prevArticle.link = linkArticle(prevArticle.title);
          }

          if (!_.isEmpty(nextArticle)) {
            nextArticle.link = linkArticle(nextArticle.title);
          }

          return {
            output : `./article/${article.title}.html`,
            data   : {
              article     : article,
              relative    : relative,
              prevArticle : prevArticle,
              nextArticle : nextArticle,
            },
          };
        });
      },
    },
    {
      template : './tag.pug',
      output   : './tag/index.html',
      picker ({ tags, articles }, setting) {
        let tagLinks = linkTag(Object.keys(tags));

        return {
          output: './tag/index.html',
          data  : {
            totalSize : articles.length,
            tags      : tags,
            tagLinks  : tagLinks,
          },
        };
      },
    },
    {
      template : './archive.pug',
      output   : './archive/index.html',
      picker ({ categories }, setting) {
        let categoryLinks = linkCategory(Object.keys(categories));
        let articleLinks  = _.map(categories, function (articles) {
          return _.map(articles, function ({ title }) {
            return linkArticle(title);
          });
        });

        return {
          output: './archive/index.html',
          data  : {
            categories    : categories,
            categoryLinks : categoryLinks,
            articleLinks  : articleLinks,
          },
        };
      },
    },
    {
      template : './error.pug',
      output   : './error.html',
    },
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
