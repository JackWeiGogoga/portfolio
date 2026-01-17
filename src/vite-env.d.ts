/// <reference types="vite/client" />

// CSS modules
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// CSS with named exports
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

// Other asset types
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.ico" {
  const content: string;
  export default content;
}
