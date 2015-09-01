# Outlier - The front end
This is the source for the website hosted at [outlier.gg](http://outlier.gg). If you are looking for the backend source, you can find it [here](https://github.com/kloong87li/league-outliers).

## About the project
You can find out more about the project [here](http://outlier.gg/about).

## Technologies
The front end uses a mixed bag of technologies. The reason? To learn new things!

The site uses standard html with scss and JXS. On top of this, we use:
  - [JQuery](https://jquery.com/)... I don't think this one needs an explanation
  - [React](https://facebook.github.io/react/index.html) for creating a dynamic front end
  - [RequireJs](http://requirejs.org/) for a more modular approach to web programming

## Try it locally!
The easiest way to host this project is to use Python. Steps:
 0. Get Python if you don't already have it. Look [here](https://www.python.org/).
 0. Checkout this repository.
 0. Navigate into the **src** directory.
 0. Run `python -m SimpleHTTPServer 5000`
 0. Done! Now to see the website just navigate to [http://localhost:5000/](http://localhost:5000/) in your favourite browser.

## Building the project from scratch
Currently building the project and getting it to generate all of the files for **prod** might be a bit difficult (sorry about that). This is due to not having enough time since this is an API competetive entry. So instead, I'm going to first go over the steps that need to happen to build the project and then explain how I do it.

So due to the use of different technologies, building this project requires a bunch of different steps. To build the project, you want to:
  0. First compile all of the scss files to generate css file. The project is setup to expect the css files in the same directory the scss file was. For instance **src/champion/champion.scss** should compile to **src/champion/champion.css** and **src/index.scss** should compile to **src/index.css**.
  1. Next you want to compile all of the JSX files. All JSX source files are in **src/a/**. The project expects all generated JS files to be in **src/js/**. Note that the folder structure of the source files should be kept in **src/js/**.
  2. After you are done with all of that all that is left to be done is to compile and optimize the project using r.js. The config file for this can be found at **src/js/build.js**.
  3. If you did all of this you should now have a generated directory called **www-built**.

Before we continue I must explain that I use Windows so all steps explained here might be slightly platform specific. Alright so how do I accomplish all of this?
  0. For the scss compilation, I use Koala. I just point it to the **src** directory and Koala will monitor any changes in any of the scss files and recompile them as needed.
  1. For this step I just use the JSX tool provided by Facebook. See [here](https://facebook.github.io/react/docs/getting-started.html#offline-transform). You can find the script I use for this in **start_jsx.bat**. Note that the script is tailored to my machine because JSX doesn't work well with cygwin.
  2. This is the easiest (and probably the most OS independent) step. Just run `./build_site_prod` in the root of this repo.

That's it!
