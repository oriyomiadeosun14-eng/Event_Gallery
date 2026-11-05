/** Everything about the event itself, in one place. Change these and the whole site follows. */
export const event = {
  couple: "Sixty & Ninety ❤️",
  monogram: "S",
  dateLong: "Saturday, 13 February 2027",
  dateShort: "13 Feb 2027",

  /** Home page photo. A 1600px version from Cloudinary, so the page doesn't load the full original. */
  heroImage: {
    src: "https://res.cloudinary.com/hqrex1vg/image/upload/w_1600,c_limit,q_auto/v1793744767/wedding/hlgztex1glkccgaqiaj7.jpg",
    alt: "The couple holding hands, smiling, in front of a green wall",
    width: 1600,
    height: 2133,
    /** Keep their faces in frame when the photo is cropped to fit. */
    focus: "object-[50%_20%]",
  },
};
