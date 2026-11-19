/* TypeScript deklaracije za CSS datoteke */

declare module "*.module.css" {
  const styles: {
    readonly [className: string]: string;
  };

  export default styles;
}

declare module "*.css";
