import {Rule} from 'sanity'

export default {
  name: 'webHostingPage',
  title: 'Web Hosting Page',
  type: 'document',

  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    },

    {
      name: 'plans',
      title: 'Pricing Plans',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', type: 'string'},
            {name: 'price', type: 'number'},
            {name: 'description', type: 'string'},

            {
              name: 'features',
              type: 'array',
              of: [{type: 'string'}],
            },

            {name: 'buttonText', type: 'string'},
            {name: 'note', type: 'string'},
          ],
        },
      ],
    },
  ],
}
