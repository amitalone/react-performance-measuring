# Quantified Performance Optimization Guide

## Table of contents
### Why speed matters ?
###   Goal
###   Example
####   Code
####   Memo
####   Virtualize Long Lists
###  Conclusion

## Why speed matters ?

Performance of your web application is one of the important business driving factor, a poor load time web application will cause bad UX triggering high user churn rate. Many a time customers like to think that the load time of information is much lesser than what it is in real life. Your customer may not return to your shopping site if your competitor site can execute the checkout process in a much smaller timespan. Many startups fail to get traction on their product because of poor performing frontend. Even search engines rank pages based on the load time.

## Goal

In this article, I will cover the quantified performance optimization approach. I will cover a simple ReactJS example code. These principals are general and can be applied to any technology stack with the right toolset.

ReactJS official document publishes a list of [checklist](https://reactjs.org/docs/optimizing-performance.html), but this guide doesn’t help us understanding how much performance did I optimize by following this checklist. For our performance optimization, we will take a Measure, Analyze & attempt to Fix approach.

In this example, we will measure poor speed Javascript code, how we can analyze it & finally try to fix the code.

We will use browser performance measurement API to measure execution time. Chrome dev tools are handy to perform speed analysis. More details can be found in the official [documentation](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference)

## Example

For our performance optimization example, we will create a react app, a Pokemon component which renders image & display a few attributes about Pokemon. We will then render a list of 50 Pokemon component then reverse order of component to trigger DOM re-render. We will then measure & optimize react re-render performance.

```javascript
import React, { memo, useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core/styles";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { Masonry } from "masonic";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
  media: {
    height: 140,
  },
}));

const PokemonCard = ({ pokemon }) => {
  const classes = useStyles();
  return (
    <Grid item>
      <Card>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={`https://pokeres.bastionbot.org/images/pokemon/${pokemon.id}.png`}
            title="ivysaur"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {pokemon.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              experience {pokemon.experience} height {pokemon.height}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};
const MemoPokemonCard = memo(PokemonCard);

const MasonryPokemonCard = ({ pokemons }) => {
  return (
    <Masonry
      items={pokemons}
      columnWidth={150}
      render={({ data: pokemon }) => {
        return <PokemonCard pokemon={pokemon} />;
      }}
    />
  );
};
const getPokemons = () => {
  let pokes = [];
  for (let i = 1; i < 50; i++) {
    pokes.push({
      id: i,
      name: `Poki Maan ${i}`,
      experience: 20 * i,
      height: 10 + i,
    });
  }
  return pokes;
};

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const App = () => {
  const classes = useStyles();
  const [pokemons, setPokemons] = useState(getPokemons());
  const prevData = usePrevious(pokemons);

  const handleReverse = () => {
    let pokes = [];
    for (let i = pokemons.length - 1; i > 0; i--) {
      pokes.push(pokemons[i]);
    }

    performance.mark("reversePokemon-start");
    setPokemons(pokes);
  };

  useEffect(() => {
    if (prevData && prevData != pokemons) {
      performance.mark("reversePokemon-end");
      performance.measure("reversePokemon-measure", "reversePokemon-start", "reversePokemon-end");
    }
  }, [pokemons]);

  const renderGrid = (pokemons) => {
    return (
      <>
        {pokemons.map((o) => {
          return <PokemonCard pokemon={o} />;
        })}
      </>
    );
  };
  const renderGridMemo = (pokemons) => {
    return (
      <>
        {pokemons.map((o) => {
          return <MemoPokemonCard pokemon={o} />;
        })}
      </>
    );
  };

  const renderVirtualGrid = (pokemons) => {
    return <MasonryPokemonCard pokemons={pokemons} />;
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleReverse}>
        Reverse Pokemon
      </Button>
      <Grid container justify="center" spacing={2}>
        {renderVirtualGrid(pokemons)}
      </Grid>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
/* Install following packages for running code*/
// npm install @material-ui/core masonic
```
Once we have this basic code running, we need to baseline the performance of the current working code. As we intend to measure re-render execution time, we will add the following browser APIs to record performance.

**window.performance.mark()** will be used to tell browser start & end of measuring events. More details can be found at the official [documentation](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark)**.**

**window.performance.measure()** will be used to tell the browser to capture measurements by name. More details can be found at the official [documentation](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure).

In our code, we will start measuring the moment the user clicks reverse Pokemon button & end the measurement once react completes re-rendering. To capture the end event, we will use the effect hook.

In the given code we will simply render 49 components & reverse them. To measure this performance open chrome dev tools & click the Performance tab. Run code

```text
npm start
```

To simulate low-end devices change the CPU throttling to 6x. Please refer diagram below
To simulate low-end devices change the CPU throttling to 6x. Please refer diagram below

# ![](https://raw.githubusercontent.com/amitalone/small_util/master/p-opt-1.png)

Once the page is rendered click the record button. Then click the “ReversePokemon” button, this will change the order of components. Now stop recording performance and click on timing node in the output window. You should see a window like a given screenshot.

# ![](https://raw.githubusercontent.com/amitalone/small_util/master/p-opt-2.png)

Repeat the same process for 3 to 4 times & baseline closest number from 3 to 4 iteration. On my machine, it took 3.11s to re-render items. We can assume this as a baseline.

Now that we have measured performance let’s attempt to optimize this.

## Optimization Recomendations

**Memoization**

React recommends to use memoization technique to improve component rendering. We will use the memo function to achieve the same. Memoization is a caching mechanism by which Javascript caches result of functions and reuse when needed. As this example focuses on measuring re-render performance, we can leverage memo function to get results from functions executed during render.

We will simply wrap PokemonCard in memo and measure performance. Change the application code to use renderGridMemo() function. Start profiling application and reverse Pokemons. A new report will measure the performance of the memo function.

On my system new test showed 2.61s as speed, that **16% reduction** in render speed. On a large scale where there are many components, it could give a significant boost.

# ![](https://raw.githubusercontent.com/amitalone/small_util/master/p-opt-3.png)

**Virtualize Long Lists**

React recommends this another optimization technique. In this method, you only render what’s visible on screen. MasonicJS, react-window, react-virtualized are popular windowing libraries. In our example, we will use masonic to test the theory.

In the given code change render function to renderVirtualGrid & measure performance. On my system, the new rendering time is 2.07s which is **35.47% reduction** over original re-render time.

# ![](https://raw.githubusercontent.com/amitalone/small_util/master/p-opt-4.png)

## Conclusion

In this article, we saw how to use Chrome Dev Tools for measuring & analyzing Javascript performance with the help of browser APIs. We were also able to validate how react recommendations helped lift up performance by 35%. I encourage you to test other recommendations & use data to improve the performance of your application. This article focuses on reactjs example but the optimization technique is applicable everywhere. Please follow the simple principle of Measure, Analyze & Fix for a quantified performance optimization.
