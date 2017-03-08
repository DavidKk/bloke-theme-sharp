import _ from 'lodash';

export default {
  ignore: [/node_modules/],
  engine: {
    use  : 'pug',
    test : /\.pug$/,
  },
  renderer: [
    {
      template: './article_list.pug',
      picker ({ articles }, setting) {
        let perPage = setting.perPage || 10;
        let chunks  = _.chunk(Object.keys(articles), perPage);

        return {
          output: './index.html',
          data  : {
            articles : chunks[0],
            page     : {
              perSize : perPage,
              total   : chunks.length,
              current : 1,
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
        let perPage  = setting.perPage || 10;
        let chunks   = _.chunk(Object.keys(articles), perPage);

        return _.map(chunks, function (chunk, page) {
          return {
            output : `./article/page/${page + 1}.html`,
            data   : {
              articles : chunk,
              page     : {
                perSize : perPage,
                total   : chunks.length,
                current : page,
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
        let pages = _.map(tags, function (articles, name) {
          let perPage  = setting.perPage || 10;
          let chunks   = _.chunk(articles, perPage);

          return _.map(chunks, function (chunk, page) {
            return {
              output : `./tag/${name}/${page}.html`,
              data   : {
                articles : chunk,
                page     : {
                  perSize : perPage,
                  total   : chunks.length,
                  current : page,
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
      picker ({ archives }, setting) {
        let pages = _.map(archives, function (articles, name) {
          let perPage  = setting.perPage || 10;
          let chunks   = _.chunk(articles, perPage);

          return _.map(chunks, function (chunk, page) {
            return {
              output : `./category/${name}/${page}.html`,
              data   : {
                articles : chunk,
                page     : {
                  perSize : perPage,
                  total   : chunks.length,
                  current : page,
                },
              },
            };
          });
        });

        return _.flattenDeep(pages);
      },
    },
    /**
     * author articles page
     */
    {
      template: './article_list.pug',
      picker ({ authors }, setting) {
        let pages = _.map(authors, function (articles, name) {
          let perPage  = setting.perPage || 10;
          let chunks   = _.chunk(articles, perPage);

          return _.map(chunks, function (chunk, page) {
            return {
              output : `./category/${name}/${page}.html`,
              data   : {
                articles : chunk,
                page     : {
                  perSize : perPage,
                  total   : chunks.length,
                  current : page,
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
