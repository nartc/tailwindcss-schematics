export interface Schema {
  /**
   * Name of the Project
   */
  project: string;
  /**
   * Directory that contains TailwindCSS and Webpack configs
   * @default .
   */
  configDirectory: string;
  /**
   * File name of TailwindCSS Config
   * @default tailwind.config
   */
  tailwindConfigFileName: string;
  /**
   * Setup PurgeCSS or not
   * @default true
   */
  usePurgeCss: boolean;
  /**
   * CSS Flavor of the project
   * @default css
   */
  cssFlavor: string;
}
