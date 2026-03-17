import type { Rule } from "sanity";


export default {
  name: "game",
  title: "Game",
  type: "document",

  fields: [
    {
      name: "name",
      title: "Game Name",
      type: "string",
     validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: "game_id",
      title: "Game ID",
      type: "number",
     validation: (Rule: Rule) => Rule.required(),
    },

    
    {
      name: "coverImg",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
     validation: (Rule: Rule) => Rule.required(),
    },

    
    {
      name: "character1Img",
      title: "Character Image 1",
      type: "image",
      options: {
        hotspot: true,
      },
     validation: (Rule: Rule) => Rule.required(),
    },

    
    {
      name: "character2Img",
      title: "Character Image 2",
      type: "image",
      options: {
        hotspot: true,
      },
     validation: (Rule: Rule) => Rule.required(),
    },

    {
      name: "game_description",
      title: "Game Description",
      type: "text",
      validation: (Rule: Rule) => Rule.required(),

    },
    {
  name: "hasBudget",
  title: "Enable Budget Tier",
  type: "boolean",
  description: "Turn OFF if this game should NOT allow Budget plans.",
  initialValue: true
},
  {
  name: "hero_features",
  title: "Hero Features",
  type: "array",
   validation: (Rule: Rule) => Rule.required(),

  of: [
    {
      type: "object",
      fields: [
        {
          name: "icon",
          title: "Icon Image",
          type: "image",
          options: {
            hotspot: true,
          },
               validation: (Rule: Rule) => Rule.required(),

        },
        {
          name: "name",
          type: "string",
          title: "Feature Name",
               validation: (Rule: Rule) => Rule.required(),

        },
      ],
    },
  ],
},

    {
      name: "whatsIncluded",
      title: "What's Included",
      type: "object",
           validation: (Rule: Rule) => Rule.required(),

      fields: [
        {
          name: "description",
          type: "string",
          title: "Description",
               validation: (Rule: Rule) => Rule.required(),

        },
        {
          name: "items",
          type: "array",
           validation: (Rule: Rule) =>
  Rule.required()
    .min(6).error("You must add at least 6 items.")
    .max(12).error("You can add at most 12 items."),


          of: [
            {
              type: "object",
              fields: [
               
                {
                  name: "icon",
                  title: "Icon Image",
                  type: "image",
                  options: {
                    hotspot: true,
                  },
                       validation: (Rule: Rule) => Rule.required(),

                },
                { name: "title", type: "string", title: "Title",     validation: (Rule: Rule) => Rule.required(),
 },
                { name: "description", type: "string", title: "Description",     validation: (Rule: Rule) => Rule.required(),
 },
              ],
            },
          ],
        },
      ],
    },

    {
      name: "about",
      title: "About Section",
      type: "object",
           validation: (Rule: Rule) => Rule.required(),

      fields: [
        { name: "title", type: "string" },
        { name: "description", type: "text" },

      
        {
          name: "image",
          title: "Image",
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    },
  ],
};
