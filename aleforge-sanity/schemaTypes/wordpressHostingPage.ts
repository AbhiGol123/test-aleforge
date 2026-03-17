import {Rule} from 'sanity'

export default {
  name: 'wordpressHostingPage',
  title: 'WordPress Hosting Page',
  type: 'document',

  fields: [
    {
      name: 'title',
      title: 'Section Title',
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
            {
              name: 'name',
              title: 'Plan Name',
              type: 'string',
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Short Description',
              type: 'string',
            },

            {
              name: 'monthlyPrice',
              title: 'Monthly Price',
              type: 'number',
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'yearlyPrice',
              title: 'Yearly Price',
              type: 'number',
              validation: (Rule: Rule) => Rule.required(),
            },

            {
              name: 'renewNote',
              title: 'Renewal Note',
              type: 'string',
              description: 'Example: $9.99/mo when you renew',
            },

            {
              name: 'features',
              title: 'Features',
              type: 'array',
              of: [{type: 'string'}],
              validation: (Rule: Rule) => Rule.required().min(1),
            },

            {
              name: 'highlight',
              title: 'Highlight Plan',
              type: 'boolean',
              initialValue: false,
            },
          ],
        },
      ],
    },
  ],
}
