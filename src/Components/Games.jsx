import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Fab,
  Avatar,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupIcon from "@mui/icons-material/Group";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import PaletteIcon from "@mui/icons-material/Palette";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CableIcon from "@mui/icons-material/Cable";
import TerrainIcon from "@mui/icons-material/Terrain";
import SearchIcon from "@mui/icons-material/Search";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { useNavigate } from "react-router-dom";

// Pongal-themed images (you'll need to add these images to your assets)
import Basketball from "../assets/BasketBall.jpg";
import Kolam from "../assets/kolam.jpg";
import TugOfWar from "../assets/TugOfWar.jpg";
import MusicalChair from "../assets/MusicalChair.jpg";
import PotBreaking from "../assets/PotBreaking.jpg";
import TreasureHunt from "../assets/TreasureHunt.jpg";
// Import your video file
import PongalVideo from "../assets/pongalhome.mp4"; // Add your video file to assets folder

// Game data for Pongal
const cardData = [
  {
    image: Basketball,
    title: "Basket Ball",
    desc: "Score points by shooting basketball into the hoop",
    rules: [
      "Each player gets 5 chances to shoot the ball into the basket",
      "Every successful shot = 1 point",
      "Players must shoot from behind the designated line",
      "Top 3 players with highest scores win prizes",
      "In case of tie, sudden death round will be conducted",
    ],
    winners: "1st, 2nd place winners",
    type: "individual",
    maxParticipants: null,
  },
  {
    image: Kolam,
    title: "Kolam Design",
    desc: "Create beautiful traditional Rangoli designs in teams",
    rules: [
      "Team event (2-4 members per team)",
      "Design area will be provided (4x4 feet)",
      "Only traditional materials allowed (rice flour, colored powder)",
      "Time limit: 60 minutes",
      "Judging criteria: Creativity, symmetry, traditional elements, neatness",
      "Teams must clean their area after completion",
    ],
    winners: "1st, 2nd place winning teams",
    type: "team",
    minMembers: 2,
    maxMembers: 4,
  },
  {
    image: TugOfWar,
    title: "Tug of War",
    desc: "Test your team's strength in this classic battle",
    rules: [
      "Team event (4-6 members per team)",
      "Maximum 6 participants per team",
      "Best of 3 rounds",
      "Winning team must pull the center marker to their side",
      "Proper footwear required (no sandals or flip-flops)",
      "Team captain must be designated before match",
    ],
    winners: "1st, 2nd place winning teams",
    type: "team",
    minMembers: 4,
    maxMembers: 6,
  },
  {
    image: MusicalChair,
    title: "Musical Chair",
    desc: "Be the last one sitting when the music stops",
    rules: [
      "Individual participation",
      "Chairs will be arranged in a circle",
      "Participants must walk around chairs when music plays",
      "When music stops, find a chair immediately",
      "One chair removed each round",
      "Last person sitting wins",
      "No pushing or physical contact allowed",
    ],
    winners: "1st, 2nd place winners",
    type: "individual",
    maxParticipants: null,
  },
  {
    image: PotBreaking,
    title: "Pot Breaking",
    desc: "Break the pot blindfolded to win prizes",
    rules: [
      "Individual participation",
      "Participants will be blindfolded and spun 3 times",
      "Must break the hanging pot with a stick",
      "Each participant gets 3 attempts",
      "Time limit: 2 minutes per attempt",
      "Pot filled with treats and gifts",
      "Winner gets contents of the pot",
    ],
    winners: "1st, 2nd place winning teams",
    type: "individual",
    maxParticipants: null,
  },
  {
    image: TreasureHunt,
    title: "Treasure Hunt",
    desc: "Solve clues and find hidden treasures in teams",
    rules: [
      "Team event (2-4 members per team)",
      "Teams will receive first clue at starting point",
      "Solve clues to find next location",
      "Time limit: 90 minutes",
      "First team to find final treasure wins",
      "No use of mobile phones allowed",
      "All clues must be found in sequence",
    ],
    winners: "1st, 2nd place winning teams",
    type: "team",
    minMembers: 2,
    maxMembers: 4,
  },
];

// Admin Login Dialog Component
function AdminLoginDialog({ open, onClose, onLoginSuccess }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");

    // Simulate login process
    setTimeout(() => {
      if (username === "pongal2026" && password === "pongal@123") {
        onLoginSuccess();
        onClose();
        setUsername("");
        setPassword("");
      } else {
        setError("Invalid username or password");
      }
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="admin-login-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: fullScreen ? 0 : 2,
          maxWidth: "400px",
          width: "100%",
          fontFamily: '"Poppins", sans-serif',
          background: "linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)",
        },
      }}
    >
      <DialogTitle
        id="admin-login-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#C62828",
          color: "white",
        }}
      >
        <Typography variant="h6" component="span" fontFamily="inherit">
          Pongal Event Admin
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, fontFamily: "inherit" ,backgroundColor:'white'}}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
          variant="outlined"
          sx={{ fontFamily: "inherit" }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          margin="normal"
          required
          variant="outlined"
          sx={{ fontFamily: "inherit" }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2,backgroundColor:'#B71C1C' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontFamily: "inherit",
            mr: 1,
            textTransform: "none",
            borderColor: "#ffffff",
            color: "#ffffff",
            "&:hover": {
              borderColor: "#B71C1C",
              backgroundColor: "rgba(198, 40, 40, 0.04)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleLogin}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            fontFamily: "inherit",
            minWidth: 100,
            textTransform: "none",
            backgroundColor: "#ffffff",
            color:'#B71C1C',
            "&:hover": {
              backgroundColor: "#B71C1C",
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Winner List Dialog Component
function WinnerListDialog({ open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all registrations
        const q = query(collection(db, "registrations"));
        const querySnapshot = await getDocs(q);

        // Group by game and find participants with 1st or 2nd prize
        const gamesMap = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const game = data.game;
          const prize = data.prize || "NONE";
          
          // Only include participants with 1st or 2nd prize
          if (prize === "FIRST" || prize === "SECOND" || prize === "THIRD") {
            if (!gamesMap[game]) {
              gamesMap[game] = [];
            }

            gamesMap[game].push({
              name: data.name,
              prize: prize,
              score: Number(data.score) || 0,
              teamName: data.teamName || "Individual",
            });
          }
        });

        // Process winners for each game
        const winnersData = cardData.map((game) => {
          const gameParticipants = gamesMap[game.title] || [];
          
          // Sort by prize (FIRST comes before SECOND) and then by score
          const sortedWinners = gameParticipants.sort((a, b) => {
            const prizeOrder = { FIRST: 1, SECOND: 2, THIRD: 3 };
            if (prizeOrder[a.prize] !== prizeOrder[b.prize]) {
              return prizeOrder[a.prize] - prizeOrder[b.prize];
            }
            return b.score - a.score;
          });

          return {
            game: game.title,
            type: game.type,
            winners: sortedWinners,
          };
        });

        setWinners(winnersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching winners: ", error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (open) {
      fetchWinners();
    }
  }, [open]);

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="winner-list-dialog-title"
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: fullScreen ? 0 : 2,
          width: "100%",
          fontFamily: '"Poppins", sans-serif',
          maxHeight: fullScreen ? "100%" : "90vh",
          background: "linear-gradient(135deg, #FFF3E0 0%, #FFECB3 100%)",
        },
      }}
    >
      <DialogTitle
        id="winner-list-dialog-title"
        sx={{
          m: 0,
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#C62828",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <EmojiEventsIcon
            sx={{ mr: 1, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
          />
          <Typography
            variant="h6"
            component="span"
            fontFamily="inherit"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Pongal Winners List
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white", p: { xs: 0.5, sm: 1 } }}
        >
          <CloseIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 0, fontFamily: "inherit", overflow: "auto" }}
      >
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            textAlign: "center",
            backgroundColor: "#FFD54F",
            background: "linear-gradient(135deg, #FFD54F 0%, #FFB300 100%)",
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            fontFamily="'Keania One', sans-serif"
            color="#C62828"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
          >
            C-TECH KONDATTAM 2026
          </Typography>
          <Typography
            variant="h6"
            color="#5D4037"
            fontFamily="inherit"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Winners List
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            Error loading winners: {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress sx={{ color: "#C62828" }} />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              maxHeight: fullScreen ? "calc(100vh - 200px)" : "400px",
              overflow: "auto",
              backgroundColor: "#FFF8E1",
            }}
          >
            <Table
              sx={{ minWidth: 300 }}
              aria-label="winner list"
              size={isMobile ? "small" : "medium"}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: "#C62828" }}>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      width: "10%",
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      fontFamily: "inherit",
                    }}
                  >
                    S.No
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      width: "25%",
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      fontFamily: "inherit",
                    }}
                  >
                    Game
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      width: "25%",
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      fontFamily: "inherit",
                    }}
                  >
                    Participant/Team Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      width: "20%",
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      fontFamily: "inherit",
                    }}
                  >
                    Prize
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      width: "20%",
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      fontFamily: "inherit",
                    }}
                  >
                    Score
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {winners.map((gameWinners, index) => (
                  <React.Fragment key={index}>
                    {gameWinners.winners.length > 0 ? (
                      gameWinners.winners.map((winner, winnerIndex) => (
                        <TableRow key={`${index}-${winnerIndex}`}>
                          {winnerIndex === 0 && (
                            <>
                              <TableCell
                                rowSpan={gameWinners.winners.length}
                                sx={{
                                  verticalAlign: "top",
                                  fontWeight: "bold",
                                  py: { xs: 1, sm: 1.5 },
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  fontFamily: "inherit",
                                  color: "#5D4037",
                                }}
                              >
                                {index + 1}.
                              </TableCell>
                              <TableCell
                                rowSpan={gameWinners.winners.length}
                                sx={{
                                  verticalAlign: "top",
                                  py: { xs: 1, sm: 1.5 },
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  fontFamily: "inherit",
                                  color: "#5D4037",
                                }}
                              >
                                <Box>
                                  <Typography sx={{ fontWeight: "bold" }}>
                                    {gameWinners.game}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#795548" }}>
                                    ({gameWinners.type})
                                  </Typography>
                                </Box>
                              </TableCell>
                            </>
                          )}
                          <TableCell sx={{ py: { xs: 0.5, sm: 1 }, fontFamily: "inherit" }}>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.9rem" },
                                py: { xs: 0.5, sm: 0.75 },
                                fontFamily: "inherit",
                                fontWeight: "bold",
                                color: "#5D4037",
                              }}
                            >
                              {winner.name}
                              {gameWinners.type === "team" && winner.teamName !== "Individual" && (
                                <Typography variant="caption" display="block" sx={{ color: "#795548" }}>
                                  Team: {winner.teamName}
                                </Typography>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: { xs: 0.5, sm: 1 }, fontFamily: "inherit" }}>
                            <Chip
                              label={
                                winner.prize === "FIRST" ? "1st Prize" :
                                winner.prize === "SECOND" ? "2nd Prize" : "3rd Prize"
                              }
                              color={winner.prize === "FIRST" ? "primary" : winner.prize === "SECOND" ? "secondary" : "warning"}
                              size="small"
                              sx={{
                                fontFamily: "inherit",
                                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                backgroundColor: 
                                  winner.prize === "FIRST" ? "#C62828" :
                                  winner.prize === "SECOND" ? "#EF6C00" : "#F9A825",
                                minWidth: "80px",
                                boxShadow: "0px 4px 3px rgba(0,0,0,0.2)",
                                fontWeight: "bold",
                                color: "white",
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: { xs: 0.5, sm: 1 }, fontFamily: "inherit" }}>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.9rem" },
                                py: { xs: 0.5, sm: 0.75 },
                                fontFamily: "inherit",
                                fontWeight: "bold",
                                color: "#5D4037",
                              }}
                            >
                              {winner.score}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            py: { xs: 1, sm: 1.5 },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            fontFamily: "inherit",
                            color: "#5D4037",
                          }}
                        >
                          {index + 1}.
                        </TableCell>
                        <TableCell
                          sx={{
                            py: { xs: 1, sm: 1.5 },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            fontFamily: "inherit",
                            color: "#5D4037",
                          }}
                        >
                          {cardData[index].title}
                        </TableCell>
                        <TableCell
                          colSpan={3}
                          sx={{
                            py: { xs: 1, sm: 1.5 },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            fontFamily: "inherit",
                            color: "#795548",
                            fontStyle: "italic",
                            textAlign: "center",
                          }}
                        >
                          No winners assigned yet
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: { xs: 1, sm: 2 }, backgroundColor: "#FFF3E0" }}>
        <Button
          autoFocus
          onClick={onClose}
          variant="contained"
          fullWidth={fullScreen}
          size={isMobile ? "small" : "medium"}
          sx={{
            mx: fullScreen ? 1 : 0,
            borderRadius: 2,
            fontFamily: "inherit",
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            backgroundColor: "#C62828",
            "&:hover": {
              backgroundColor: "#B71C1C",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Chat Dialog Component
function ChatDialog({ open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm the C-Tech KONDATTAM Festival assistant. How can I help you?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim() === "") return;

    // Add user message
    const userMessage = {
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);

    // Process message and generate response
    let responseText = "";
    const text = inputText.toLowerCase();

    // Check for game-specific queries
    const gameQueries = cardData.map((game) => ({
      name: game.title.toLowerCase(),
      keywords: game.title.toLowerCase().split(" "),
      game: game,
    }));

    let matchedGame = null;
    let isRuleQuery = text.includes("rule") || text.includes("how to play");

    // Check if user is asking about a specific game
    for (const gameQuery of gameQueries) {
      if (
        gameQuery.keywords.some((keyword) => text.includes(keyword)) ||
        text.includes(gameQuery.name)
      ) {
        matchedGame = gameQuery.game;
        break;
      }
    }

    if (matchedGame) {
      if (isRuleQuery) {
        // Show rules for the specific game
        responseText = `Rules for ${matchedGame.title} (${matchedGame.type}):\n\n${matchedGame.rules
          .map((rule, index) => `${index + 1}. ${rule}`)
          .join("\n")}\n\n${matchedGame.winners}`;
        
        if (matchedGame.type === "team") {
          responseText += `\nTeam size: ${matchedGame.minMembers}-${matchedGame.maxMembers} members`;
        }
      } else {
        // Show general info about the game
        responseText = `${matchedGame.title} (${matchedGame.type}): ${matchedGame.desc}. You can ask about the rules by saying "What are the rules for ${matchedGame.title}?"`;
      }
    } else if (
      text.includes("list games") ||
      text.includes("what games") ||
      text.includes("available games")
    ) {
      // List all available games with proper formatting
      responseText =
        "C-Tech KONDATTAM Festival Games:\n\n" +
        cardData
          .map((game, index) => `${index + 1}. ${game.title} (${game.type}) - ${game.desc}`)
          .join("\n\n") +
        "\n\nYou can ask about specific games by name or ask about their rules.";
    } else if (
      text.includes("event") ||
      text.includes("when") ||
      text.includes("date")
    ) {
      responseText =
        "The C-Tech KONDATTAM Festival is on January 14th, 2026 from 9 AM to 6 PM.";
    } else if (
      text.includes("pongal") ||
      text.includes("festival") ||
      text.includes("about")
    ) {
      responseText =
        "C-Tech KONDATTAM is a harvest festival celebration at C-Tech Company. It's a day of traditional games, fun activities, and team bonding. Join us for an unforgettable experience!";
    } else if (
      text.includes("hi") ||
      text.includes("hello") ||
      text.includes("hey")
    ) {
      responseText =
        "Hello! Welcome to C-Tech KONDATTAM 2026. How can I assist you today? You can ask about games, event details, or festival information.";
    } else if (text.includes("game") || text.includes("register")) {
      responseText =
        "You can register for any game by clicking the 'Register Now' button on the game card. For team games, team leader should register with team details. To see available games, ask 'What games are available?'";
    } else if (text.includes("location") || text.includes("where")) {
      responseText =
        "The festival will be held at C-Tech Campus Ground, Chennai.";
    } else if (text.includes("team") || text.includes("group")) {
      responseText =
        "Team games include Kolam Design (2-4 members), Tug of War (4-6 members), and Treasure Hunt (2-4 members). Team leader should register with all team members' names.";
    } else if (text.includes("prize") || text.includes("winner")) {
      responseText =
        "All games have prizes for 1st, 2nd and 3rd places. Special prizes for traditional games like Kolam Design and Pot Breaking.";
    } else {
      responseText =
        "I'm sorry, I didn't understand that. You can ask me about: \n- Available games\n- Game rules (e.g., 'Kolam Design rules')\n- Event date and location\n- Team registration\n- Festival information\n- Prizes and winners";
    }

    // Add bot response after a short delay
    setTimeout(() => {
      const botMessage = {
        text: responseText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInputText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="chat-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: fullScreen ? 0 : 2,
          width: fullScreen ? "100%" : "400px",
          height: fullScreen ? "100%" : "500px",
          maxWidth: "none",
          fontFamily: '"Poppins", sans-serif',
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
        },
      }}
    >
      <DialogTitle
        id="chat-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#C62828",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              mr: 1.5,
              bgcolor: "white",
              color: "#C62828",
            }}
          >
            C
          </Avatar>
          <Typography variant="h6" component="span" fontFamily="inherit">
            C-Tech Assistant
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ flexGrow: 1, p: 2, overflow: "auto", backgroundColor: "#FFFDE7" }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Paper
              sx={{
                p: 1.5,
                maxWidth: "70%",
                backgroundColor:
                  message.sender === "user" ? "#C62828" : "#FFD54F",
                color: message.sender === "user" ? "white" : "#5D4037",
                borderRadius: 2,
                border: message.sender === "bot" ? "1px solid #FFB300" : "none",
              }}
            >
              <Typography variant="body2" fontFamily="inherit" sx={{ whiteSpace: 'pre-line' }}>
                {message.text}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                textAlign="right"
                sx={{ opacity: 0.7, mt: 0.5, color: message.sender === "user" ? "rgba(255,255,255,0.7)" : "rgba(93,64,55,0.7)" }}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Paper>
          </Box>
        ))}
      </DialogContent>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", backgroundColor: "#FFF8E1" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={inputText.trim() === ""}
            sx={{ color: "#C62828" }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
}

// Rules Dialog Component
function RulesDialog({ open, onClose, game }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const getGameIcon = (title) => {
    switch(title) {
      case "Basket Ball": return <SportsBasketballIcon sx={{ mr: 1, color: "#C62828", fontSize: 30 }} />;
      case "Kolam Design": return <PaletteIcon sx={{ mr: 1, color: "#C62828", fontSize: 30 }} />;
      case "Tug of War": return <CableIcon sx={{ mr: 1, color: "#C62828", fontSize: 30 }} />;
      case "Musical Chair": return <MusicNoteIcon sx={{ mr: 1, color: "#C62828", fontSize: 30 }} />;
      case "Pot Breaking": return <TerrainIcon sx={{ mr: 1, color: "#C62828", fontSize: 30 }} />;
      case "Treasure Hunt": return <SearchIcon sx={{ mr: 1, color: "#C62828", fontSize: 30 }} />;
      default: return <GroupIcon sx={{ mr: 1, color: "#C62828", fontSize: 30 }} />;
    }
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="rules-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: fullScreen ? 0 : 2,
          maxWidth: "600px",
          width: "100%",
          fontFamily: '"Poppins", sans-serif',
          background: "linear-gradient(135deg, #FFF3E0 0%, #FFECB3 100%)",
        },
      }}
    >
      <DialogTitle
        id="rules-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#C62828",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {getGameIcon(game?.title)}
          <Typography variant="h6" component="span" fontFamily="inherit">
            {game?.title} Rules
          </Typography>
          {game?.type === "team" && (
            <Chip
              label="Team Event"
              size="small"
              sx={{
                ml: 2,
                backgroundColor: "#FFB300",
                color: "#5D4037",
                fontWeight: "bold",
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, fontFamily: "inherit" }}>
        <Box sx={{ p: 2, backgroundColor: "#FFD54F" }}>
          <Typography
            variant="body1"
            sx={{ fontStyle: "italic", color: "#5D4037" }}
            fontFamily="inherit"
          >
            {game?.desc}
          </Typography>
          {game?.type === "team" && (
            <Typography
              variant="subtitle2"
              sx={{ mt: 1, color: "#795548", fontWeight: "bold" }}
              fontFamily="inherit"
            >
              Team Size: {game?.minMembers}-{game?.maxMembers} members
            </Typography>
          )}
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#C62828",
              mb: 2,
            }}
            fontFamily="inherit"
          >
            How to play
          </Typography>
          <List sx={{ mt: { xs: -2, sm: 1 } }}>
            {game?.rules.map((rule, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#C62828",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={rule}
                  primaryTypographyProps={{
                    fontFamily: "inherit",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    color: "#5D4037",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ borderColor: "#FFB300" }} />

        <Box sx={{ p: 2, backgroundColor: "#C62828" }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            fontFamily="inherit"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, color: "white" }}
          >
            Winners: {game?.winners}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: "#FFF3E0" }}>
        <Button
          autoFocus
          onClick={onClose}
          variant="contained"
          fullWidth={fullScreen}
          sx={{
            mx: fullScreen ? 2 : 0,
            borderRadius: 2,
            fontFamily: "inherit",
            textTransform: "none",
            backgroundColor: "#C62828",
            "&:hover": {
              backgroundColor: "#B71C1C",
            },
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Registration Dialog Component
function RegisterDialog({ open, onClose, game }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    phone: "",
    game: game?.title || "",
    teamName: "",
    teamMembers: Array(game?.type === "team" ? (game?.minMembers || 2) : 1).fill(""),
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (game) {
      setFormData({
        name: "",
        designation: "",
        phone: "",
        game: game.title || "",
        teamName: "",
        teamMembers: Array(game.type === "team" ? (game.minMembers || 2) : 1).fill(""),
      });
    }
  }, [game]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTeamMemberChange = (index, value) => {
    const newTeamMembers = [...formData.teamMembers];
    newTeamMembers[index] = value;
    setFormData({
      ...formData,
      teamMembers: newTeamMembers,
    });
  };

  const addTeamMember = () => {
    if (formData.teamMembers.length < (game?.maxMembers || 4)) {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, ""],
      });
    }
  };

  const removeTeamMember = (index) => {
    if (formData.teamMembers.length > (game?.minMembers || 2)) {
      const newTeamMembers = formData.teamMembers.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        teamMembers: newTeamMembers,
      });
    }
  };

  const checkRegistrationLimit = async (phone) => {
    try {
      const q = query(
        collection(db, "registrations"),
        where("phone", "==", phone)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (err) {
      console.error("Error checking registration limit: ", err);
      return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate phone number
    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    // Validate team name for team events
    if (game?.type === "team" && !formData.teamName.trim()) {
      setError("Please enter a team name");
      setLoading(false);
      return;
    }

    // Validate team members for team events
    if (game?.type === "team") {
      const validMembers = formData.teamMembers.filter(member => member.trim() !== "");
      if (validMembers.length < (game.minMembers || 2)) {
        setError(`Please enter at least ${game.minMembers} team members`);
        setLoading(false);
        return;
      }
    }

    try {
      // Check if user has already registered for 3 games
      const registrationCount = await checkRegistrationLimit(formData.phone);

      if (registrationCount >= 3) {
        setError(
          "You have already registered for 3 games. Each participant can only register for 3 games."
        );
        setLoading(false);
        return;
      }

      // Check if user has already registered for this specific game
      const gameCheckQuery = query(
        collection(db, "registrations"),
        where("phone", "==", formData.phone),
        where("game", "==", game.title)
      );
      const gameCheckSnapshot = await getDocs(gameCheckQuery);

      if (!gameCheckSnapshot.empty) {
        setError("You have already registered for this game.");
        setLoading(false);
        return;
      }

      // For team games, register each team member
      if (game?.type === "team") {
        const validMembers = formData.teamMembers.filter(member => member.trim() !== "");
        
        for (const member of validMembers) {
          await addDoc(collection(db, "registrations"), {
            name: member,
            phone: formData.phone,
            game: game.title,
            teamName: formData.teamName,
            timestamp: serverTimestamp(),
            eventType: "pongal2026",
          });
        }
      } else {
        // For individual games
        await addDoc(collection(db, "registrations"), {
          name: formData.name,
          designation: formData.designation,
          phone: formData.phone,
          game: game.title,
          timestamp: serverTimestamp(),
          eventType: "pongal2026",
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("Failed to register. Please try again.");
      console.error("Error adding document: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="register-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: fullScreen ? 0 : 2,
          maxWidth: "500px",
          width: "100%",
          fontFamily: '"Poppins", sans-serif',
          background: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
        },
      }}
    >
      <DialogTitle
        id="register-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#C62828",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {game?.type === "team" && <GroupIcon sx={{ mr: 1.5, fontSize: 30 }} />}
          <Typography
            variant="h6"
            component="span"
            fontFamily="inherit"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Register for {game?.title}
          </Typography>
          {game?.type === "team" && (
            <Chip
              label="Team"
              size="small"
              sx={{
                ml: 2,
                backgroundColor: "#FFB300",
                color: "#5D4037",
                fontWeight: "bold",
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, fontFamily: "inherit" }}>
        {success ? (
          <Alert severity="success" sx={{ mb: 2, backgroundColor: "#C8E6C9", color: "#1B5E20" }}>
            Registration successful! We'll see you at the C-Tech KONDATTAM Festival.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: "#FFCDD2", color: "#C62828" }}>
                {error}
              </Alert>
            )}

            {game?.type === "team" ? (
              <>
                <Typography variant="subtitle1" fontWeight="bold" color="#5D4037" gutterBottom>
                  Team Registration ({formData.teamMembers.length}/{game.maxMembers} members)
                </Typography>
                
                <TextField
                  fullWidth
                  label="Team Name"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ fontFamily: "inherit" }}
                />

                <Typography variant="subtitle2" color="#795548" sx={{ mt: 2, mb: 1 }}>
                  Team Leader (Primary Contact)
                </Typography>
                <TextField
                  fullWidth
                  label="Team Leader Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ fontFamily: "inherit" }}
                />

                <TextField
                  fullWidth
                  label="Team Leader Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ fontFamily: "inherit" }}
                  helperText="This phone will be used for all communications"
                />

                <Typography variant="subtitle2" color="#795548" sx={{ mt: 2, mb: 1 }}>
                  Team Members (Minimum {game.minMembers}, Maximum {game.maxMembers})
                </Typography>
                
                {formData.teamMembers.map((member, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Member ${index + 1}`}
                      value={member}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      margin="normal"
                      required={index < game.minMembers}
                      variant="outlined"
                      sx={{ fontFamily: "inherit", mr: 1 }}
                    />
                    {formData.teamMembers.length > game.minMembers && (
                      <IconButton
                        onClick={() => removeTeamMember(index)}
                        size="small"
                        sx={{ color: "#C62828" }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                {formData.teamMembers.length < game.maxMembers && (
                  <Button
                    onClick={addTeamMember}
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 1,
                      color: "#C62828",
                      borderColor: "#C62828",
                      "&:hover": {
                        borderColor: "#B71C1C",
                        backgroundColor: "rgba(198, 40, 40, 0.04)",
                      },
                    }}
                  >
                    + Add Team Member
                  </Button>
                )}
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ fontFamily: "inherit" }}
                />

                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ fontFamily: "inherit" }}
                />

                <TextField
                  fullWidth
                  label="Phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ fontFamily: "inherit" }}
                  helperText="We'll use this to check your registration limit (max 3 games per person)"
                />
              </>
            )}

            <input type="hidden" name="game" value={formData.game} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: "#FFF3E0" }}>
        {!success && (
          <>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderRadius: 2,
                fontFamily: "inherit",
                mr: 1,
                textTransform: "none",
                borderColor: "#C62828",
                color: "#C62828",
                "&:hover": {
                  borderColor: "#B71C1C",
                  backgroundColor: "rgba(198, 40, 40, 0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                fontFamily: "inherit",
                minWidth: 100,
                textTransform: "none",
                backgroundColor: "#C62828",
                "&:hover": {
                  backgroundColor: "#B71C1C",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Main Component
export default function Games() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [adminLoginDialogOpen, setAdminLoginDialogOpen] = useState(false);
  const [winnerListDialogOpen, setWinnerListDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Auto-play video on component mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Video autoplay blocked:", err);
        // If autoplay is blocked, mute and try again
        videoRef.current.muted = true;
        videoRef.current.play().catch(err2 => {
          console.log("Muted video autoplay also blocked:", err2);
        });
      });
    }
  }, []);

  const handleRulesClick = (game) => {
    setSelectedGame(game);
    setRulesDialogOpen(true);
  };

  const handleRegisterClick = (game) => {
    setSelectedGame(game);
    setRegisterDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setRulesDialogOpen(false);
    setRegisterDialogOpen(false);
    setChatDialogOpen(false);
    setAdminLoginDialogOpen(false);
    setWinnerListDialogOpen(false);
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    navigate("/admin");
  };

  const handleAdminButtonClick = () => {
    setAdminLoginDialogOpen(true);
  };

  const handleWinnerListClick = () => {
    setWinnerListDialogOpen(true);
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ 
          bgcolor: "#FFF3E0", 
          color: "#5D4037", 
          py: 1,
          borderBottom: "3px solid #C62828",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: "48px", sm: "64px" } }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            sx={{
              flexGrow: 1,
              color: "#C62828",
              fontFamily: "Poppins, sans-serif",
              userSelect: "none",
              fontSize: { xs: ".8rem", sm: "1.8rem", md: "2.2rem" },
              lineHeight: { xs: "1.2", sm: "1.5" },
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            🎉  C-Tech KONDATTAM 2026
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: { xs: 0.5, sm: 1 },
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleWinnerListClick}
              sx={{
                borderRadius: 2,
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.875rem" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                minWidth: { xs: "auto", sm: "64px" },
                whiteSpace: "nowrap",
                borderColor: "#C62828",
                color: "#C62828",
                "&:hover": {
                  borderColor: "#B71C1C",
                  backgroundColor: "rgba(198, 40, 40, 0.04)",
                },
              }}
            >
              Results
            </Button>
            <Button
              variant="outlined"
              onClick={handleAdminButtonClick}
              sx={{
                borderRadius: 2,
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.875rem" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                minWidth: { xs: "auto", sm: "64px" },
                whiteSpace: "nowrap",
                borderColor: "#C62828",
                color: "#C62828",
                "&:hover": {
                  borderColor: "#B71C1C",
                  backgroundColor: "rgba(198, 40, 40, 0.04)",
                },
              }}
            >
              Admin
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Video Banner Section */}
      <Box
        sx={{
          width: { xs: "100%", sm: "100%", md: "100%" },
          margin: "auto",
          mt: { xs: 0, sm: 0 },
          mb: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 0,
          userSelect: "none",
          overflow: "hidden",
          position: "relative",
          height: { xs: "25vh", sm: "50vh", md: "100vh" },
                      boxShadow:"none"

        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            backgroundColor: "white",
            boxShadow:"none"
          }}
        >
          <source src={PongalVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
       
      </Box>

      <Box
        sx={{            
          background: "linear-gradient(135deg, #FFFDE7 0%, #FFF3E0 100%)",
          py: 5,
          display: "flex",
          justifyContent: "center",
          minHeight: "80vh",
          fontFamily: '"Poppins", sans-serif',
          userSelect: "none",
        }}
      >
        <Box sx={{  width: "100%" }}>
          <Typography
            variant="h1"
            component="h2"
            textAlign="center"
            fontWeight="600"
            mb={1}
            fontFamily="inherit"
            color="#C62828"
            sx={{
              fontFamily: "'Keania One', sans-serif",
              fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
              mt: { xs: -4, sm: 0}
            }}
          >
            🎯 Game Registration
          </Typography>

          <Typography
            variant="h5"
            textAlign="center"
            mb={8}
            mt={2}
            fontFamily="inherit"
            sx={{
              maxWidth: 800,
              mx: { xs: 1, sm: "auto" },
              color: "#5D4037",
              fontWeight: "600",
              fontFamily: "Inter",
              fontSize: { xs: "0.9rem", sm: "1.25rem", md: "1.5rem" },
              px: { xs: 1, sm: 2 },
              backgroundColor: "#FFD54F",
              padding: "12px 24px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              
            }}
          >
            Register for traditional Pongal games and celebrate the harvest festival with joy! 
            Each participant can register for up to 3 games.
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{ mt: { xs: -5, sm: 2 } }}
          >
            {cardData.map((game) => (
              <Grid key={game.title} item xs={12} sm={6} md={4} lg={4}>
                <Card
                  tabIndex={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.paper",
                    minWidth: { xs: 350, sm: 500 },
                    maxWidth: { xs: 350, sm: 400 },
                    border: "3px solid #FFB300",
                    borderRadius: 4,
                    boxShadow: "0 10px 30px rgba(198, 40, 40, 0.15)",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 15px 40px rgba(198, 40, 40, 0.25)",
                      borderColor: "#C62828",
                    },
                    "&:focus-visible": {
                      outline: "3px solid",
                      outlineColor: "#C62828",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  {/* Title section with Pongal theme */}
                  <Box
                    sx={{
                      background: "linear-gradient(135deg, #C62828 0%, #B71C1C 100%)",
                      color: "white",
                      py: 1.5,
                      px: 3,
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {game.type === "team" && (
                      <GroupIcon 
                        sx={{ 
                          position: "absolute", 
                          left: 8, 
                          top: "50%", 
                          transform: "translateY(-50%)",
                          opacity: 0.3,
                          fontSize: 40 
                        }} 
                      />
                    )}
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      fontFamily="inherit"
                      sx={{
                        textTransform: "none",
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {game.title}
                    </Typography>
                    {game.type === "team" && (
                      <Chip
                        label="Team"
                        size="small"
                        sx={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "#FFB300",
                          color: "#5D4037",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          height: "20px",
                        }}
                      />
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: { xs: 2, sm: 3 },
                      textAlign: "center",
                      background: "linear-gradient(to bottom, #ffffff, #ffffff)",
                    }}
                  >
                    <Box
                      component="img"
                      src={game.image}
                      alt={game.title}
                      sx={{
                        width: { xs: 150, sm: 200 },
                        height: "auto",
                        mb: 2,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1) rotate(5deg)",
                        },
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="#5D4037"
                      lineHeight={1.6}
                      sx={{ mb: 2, minHeight: "60px" }}
                      fontFamily="inherit"
                      fontSize={{ xs: "0.875rem", sm: "1rem" }}
                    >
                      {game.desc}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={game.winners}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          fontFamily: "inherit",
                          fontWeight: 500,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          backgroundColor: "#FFD54F",
                          color: "#5D4037",
                        }}
                      />
                      {game.type === "team" && (
                        <Chip
                          label={`${game.minMembers}-${game.maxMembers} members`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            fontFamily: "inherit",
                            fontWeight: 500,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            borderColor: "#C62828",
                            color: "#C62828",
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>

                  <CardActions
                    sx={{
                      pb: 2,
                      px: { xs: 1, sm: 3 },
                      bgcolor: "#FFF3E0",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1, sm: 0 },
                    }}
                  >
                    <Button
                      fullWidth={isMobile}
                      size="small"
                      variant="outlined"
                      onClick={() => handleRulesClick(game)}
                      sx={{
                        mr: { sm: 1 },
                        borderRadius: 2,
                        fontFamily: "inherit",
                        textTransform: "none",
                        fontWeight: 500,
                        py: 1,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        borderColor: "#C62828",
                        color: "#C62828",
                        "&:hover": {
                          borderColor: "#B71C1C",
                          backgroundColor: "rgba(198, 40, 40, 0.04)",
                        },
                      }}
                    >
                      View Rules
                    </Button>
                    <Button
                      fullWidth={isMobile}
                      size="small"
                      variant="contained"
                      onClick={() => handleRegisterClick(game)}
                      sx={{
                        borderRadius: 2,
                        fontFamily: "inherit",
                        textTransform: "none",
                        fontWeight: 500,
                        py: 1,
                        boxShadow: "0 4px 12px rgba(198, 40, 40, 0.3)",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        backgroundColor: "#C62828",
                        "&:hover": {
                          backgroundColor: "#B71C1C",
                          boxShadow: "0 6px 16px rgba(198, 40, 40, 0.4)",
                        },
                      }}
                    >
                      Register Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          background: "linear-gradient(135deg, #C62828 0%, #B71C1C 100%)",
          color: "white",
          py: 3,
          textAlign: "center",
          borderTop: "3px solid #FFB300",
        }}
      >
        <Typography
          fontFamily="inherit"
          fontSize={{ xs: "0.875rem", sm: "1rem" }}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}
        >
          <span>© 2026 C-Tech KONDATTAM  • </span>
          <span style={{ fontFamily: "inherit", fontSize: "1rem", marginLeft: "4px", fontWeight: 600 }}>
            🎉 Celebrating Harvest & Tradition 🎉
          </span>
        </Typography>
           <Typography
          fontFamily="inherit"
          fontSize={{ xs: "0.875rem", sm: "1rem", }}

          sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", mt:3}}
        >
          <span> • Designed & Developed by C-Tech IT Department •</span>
      
        </Typography>
      </Box>

      {/* Floating Chat Button */}
      <Fab
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: "#C62828",
          color: "white",
          "&:hover": {
            backgroundColor: "#B71C1C",
          },
        }}
        aria-label="chat"
        onClick={() => setChatDialogOpen(true)}
      >
        <Badge color="warning" variant="dot">
          <ChatIcon />
        </Badge>
      </Fab>

      <RulesDialog
        open={rulesDialogOpen}
        onClose={handleCloseDialog}
        game={selectedGame}
      />

      <RegisterDialog
        open={registerDialogOpen}
        onClose={handleCloseDialog}
        game={selectedGame}
      />

      <ChatDialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
      />

      <AdminLoginDialog
        open={adminLoginDialogOpen}
        onClose={handleCloseDialog}
        onLoginSuccess={handleAdminLogin}
      />

      <WinnerListDialog
        open={winnerListDialogOpen}
        onClose={handleCloseDialog}
      />

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Keania+One&family=Inter:wght@400;500;600&display=swap');
          
          body {
            background: linear-gradient(135deg, #FFFDE7 0%, #FFF3E0 100%);
            min-height: 100vh;
          }
        `}
      </style>
    </>
  );
}