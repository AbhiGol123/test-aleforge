import {Rule} from 'sanity'

export default {
  name: 'dedicatedServer',
  title: 'Dedicated Server',
  type: 'document',

  fields: [
    {
      name: 'cpuBrand',
      title: 'CPU Brand',
      type: 'string',
      options: {
        list: [
          {title: 'Intel', value: 'intel'},
          {title: 'AMD', value: 'amd'},
        ],
        layout: 'radio',
      },
      validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: 'cpuModel',
      title: 'CPU Model',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: 'cores',
      title: 'Cores',
      type: 'number',
      validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: 'threads',
      title: 'Threads',
      type: 'number',
      validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: 'cpuFrequency',
      title: 'CPU Frequency',
      type: 'string',
      description: 'Example: 3.6GHz',
    },

    {
      name: 'ram',
      title: 'RAM',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: 'ramLabel',
      title: 'RAM Label',
      type: 'string',
      description: 'Example: DDR5 ECC, DDR4, DDR3',
    },

    {
      name: 'storage',
      title: 'Storage',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'storageLabel',
      title: 'Storage Type',
      type: 'string',
      options: {
        list: [
          {title: 'NVMe', value: 'nvme'},
          {title: 'SSD', value: 'ssd'},
          {title: 'HDD', value: 'hdd'},
        ],
        layout: 'radio',
      },
      validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: 'transfer',
      title: 'Transfer',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: 'networkSpeed',
      title: 'Network Speed',
      type: 'string',
      description: 'Example: 1 Gbps, 10 Gbps, 100 Mbps',
    },

    {
      name: 'price',
      title: 'Price / Month',
      type: 'number',
      validation: (Rule: Rule) => Rule.required().min(0),
    },

    {
      name: 'locations',
      title: 'Available Locations',
      type: 'array',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'United States', value: 'us'},
              {title: 'Australia', value: 'au'},
              {title: 'Canada', value: 'ca'},
              {title: 'Europe', value: 'eu'},
              {title: 'India', value: 'in'},
              {title: 'Singapore', value: 'sg'},
              {title: 'United Kingdom', value: 'gb'},
            ],
          },
        },
      ],
      options: {
        layout: 'list', // ✅ CLICK-ONLY MULTISELECT
      },
      validation: (Rule: Rule) => Rule.min(1),
    },
  ],
}
