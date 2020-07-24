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
