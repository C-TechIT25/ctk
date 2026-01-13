import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
  Tab,
  Tabs,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Fab,
  Divider,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  Avatar,
  AvatarGroup,
  Collapse,
  Badge,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { useNavigate } from "react-router-dom";

// Pongal game categories
const gameCategories = [
  "All Games",
  "Basket Ball",
  "Kolam Design",
  "Tug of War",
  "Musical Chair",
  "Pot Breaking",
  "Treasure Hunt",
];

// Game type information
const gameTypes = {
  "Basket Ball": { type: "individual", minMembers: 1, maxMembers: 1 },
  "Kolam Design": { type: "team", minMembers: 2, maxMembers: 4 },
  "Tug of War": { type: "team", minMembers: 4, maxMembers: 6 },
  "Musical Chair": { type: "individual", minMembers: 1, maxMembers: 1 },
  "Pot Breaking": { type: "individual", minMembers: 1, maxMembers: 1 },
  "Treasure Hunt": { type: "team", minMembers: 2, maxMembers: 4 },
};

// Prize options
const prizeOptions = {
  NONE: "No Prize",
  FIRST: "1st Prize",
  SECOND: "2nd Prize",
  THIRD: "3rd Prize",
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>
      )}
    </div>
  );
}

export default function Score() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [scores, setScores] = useState({});
  const [prizes, setPrizes] = useState({});
  const [saveStatus, setSaveStatus] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saveAllDialogOpen, setSaveAllDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(
        query(collection(db, "registrations"), orderBy("timestamp", "desc"))
      );
      
      // Group team registrations
      const registrationsData = [];
      const teamMap = {};
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        
        // If it's a team registration and has teamName, group them
        if (data.teamName && data.teamName.trim() !== "") {
          const teamKey = `${data.teamName}_${data.game}_${data.phone}`;
          if (!teamMap[teamKey]) {
            teamMap[teamKey] = {
              ...data,
              isTeam: true,
              allMembers: [data.name],
              memberIds: [doc.id],
              memberData: [data]
            };
          } else {
            teamMap[teamKey].allMembers.push(data.name);
            teamMap[teamKey].memberIds.push(doc.id);
            teamMap[teamKey].memberData.push(data);
          }
        } else {
          // Individual registration
          registrationsData.push({ ...data, isTeam: false });
        }
      });

      // Add team registrations
      Object.values(teamMap).forEach(team => {
        registrationsData.push(team);
      });

      setRegistrations(registrationsData);

      // Initialize scores and prizes from existing data
      const initialScores = {};
      const initialPrizes = {};
      
      registrationsData.forEach((reg) => {
        if (reg.isTeam) {
          // For teams, use first member's score and prize
          initialScores[reg.memberIds[0]] = reg.memberData[0]?.score || "";
          initialPrizes[reg.memberIds[0]] = reg.memberData[0]?.prize || "NONE";
        } else {
          initialScores[reg.id] = reg.score || "";
          initialPrizes[reg.id] = reg.prize || "NONE";
        }
      });
      
      setScores(initialScores);
      setPrizes(initialPrizes);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching registrations: ", error);
      setError("Failed to fetch registrations");
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSearchQuery("");
  };

  const handleSelectChange = (event) => {
    handleTabChange(null, event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleRowExpansion = (registrationId) => {
    setExpandedRows(prev => ({
      ...prev,
      [registrationId]: !prev[registrationId]
    }));
  };

  const handleScoreChange = (id, value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setScores((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handlePrizeChange = async (id, prizeValue) => {
    try {
      setPrizes((prev) => ({ ...prev, [id]: prizeValue }));
      
      const registration = registrations.find(r => 
        r.id === id || (r.isTeam && r.memberIds.includes(id))
      );
      
      if (registration?.isTeam) {
        // Update prize for all team members
        const updatePromises = registration.memberIds.map(memberId => {
          const docRef = doc(db, "registrations", memberId);
          return updateDoc(docRef, { prize: prizeValue });
        });
        await Promise.all(updatePromises);
      } else {
        // Update prize for individual
        const docRef = doc(db, "registrations", id);
        await updateDoc(docRef, { prize: prizeValue });
      }
      
      setSuccess("Prize updated successfully");
      setTimeout(() => setSuccess(""), 3000);
      handleMenuClose();
    } catch (error) {
      console.error("Error updating prize: ", error);
      setError("Failed to update prize");
    }
  };

  const handleSaveScore = async (registration) => {
    try {
      const id = registration.isTeam ? registration.memberIds[0] : registration.id;
      setSaveStatus((prev) => ({ ...prev, [id]: "saving" }));
      
      if (registration.isTeam) {
        // Save score for all team members
        const updatePromises = registration.memberIds.map(memberId => {
          const docRef = doc(db, "registrations", memberId);
          return updateDoc(docRef, { 
            score: parseInt(scores[id]) || 0,
            prize: prizes[id] || "NONE"
          });
        });
        await Promise.all(updatePromises);
      } else {
        // Save score for individual
        const docRef = doc(db, "registrations", id);
        await updateDoc(docRef, { 
          score: parseInt(scores[id]) || 0,
          prize: prizes[id] || "NONE"
        });
      }

      setSaveStatus((prev) => ({ ...prev, [id]: "saved" }));
      setTimeout(() => {
        setSaveStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[id];
          return newStatus;
        });
      }, 2000);

      setSuccess("Score saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving score: ", error);
      const id = registration.isTeam ? registration.memberIds[0] : registration.id;
      setSaveStatus((prev) => ({ ...prev, [id]: "error" }));
      setError("Failed to save score");
    }
  };

  const handleSaveAllScores = async () => {
    try {
      setSaveAllDialogOpen(false);
      setLoading(true);

      const updatePromises = registrations.map(registration => {
        if (registration.isTeam) {
          const id = registration.memberIds[0];
          return Promise.all(registration.memberIds.map(memberId => {
            const docRef = doc(db, "registrations", memberId);
            return updateDoc(docRef, { 
              score: parseInt(scores[id]) || 0,
              prize: prizes[id] || "NONE"
            });
          }));
        } else {
          const docRef = doc(db, "registrations", registration.id);
          return updateDoc(docRef, { 
            score: parseInt(scores[registration.id]) || 0,
            prize: prizes[registration.id] || "NONE"
          });
        }
      });

      await Promise.all(updatePromises.flat());
      setLoading(false);
      setSuccess("All scores saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving all scores: ", error);
      setLoading(false);
      setError("Failed to save all scores");
    }
  };

  const handleMenuOpen = (event, participant) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedParticipant(participant);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedParticipant(null);
  };

  const getPrizeColor = (prize) => {
    switch (prize) {
      case "FIRST": return "#FFD700"; // Gold
      case "SECOND": return "#C0C0C0"; // Silver
      case "THIRD": return "#CD7F32"; // Bronze
      default: return "default";
    }
  };

  const getPrizeText = (prize) => {
    return prizeOptions[prize] || prizeOptions.NONE;
  };

  const getGameTypeIcon = (game) => {
    const gameType = gameTypes[game]?.type;
    return gameType === "team" ? <GroupIcon fontSize="small" /> : <PersonIcon fontSize="small" />;
  };

  const filteredRegistrations = registrations
    .filter((reg) => {
      if (selectedTab !== 0 && reg.game !== gameCategories[selectedTab]) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          reg.name?.toLowerCase(),
          reg.phone?.toLowerCase(),
          reg.game?.toLowerCase(),
          reg.teamName?.toLowerCase(),
        ];
        
        if (reg.isTeam && reg.allMembers) {
          reg.allMembers.forEach(member => {
            searchFields.push(member.toLowerCase());
          });
        }
        
        return searchFields.some(field => field && field.includes(query));
      }

      return true;
    })
    .sort((a, b) => {
      const scoreA = parseInt(scores[a.isTeam ? a.memberIds[0] : a.id]) || 0;
      const scoreB = parseInt(scores[b.isTeam ? b.memberIds[0] : b.id]) || 0;

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const nameA = a.isTeam ? a.teamName : a.name;
      const nameB = b.isTeam ? b.teamName : b.name;
      return nameA.localeCompare(nameB);
    });

  // Get top 3 performers
  const topPerformers = filteredRegistrations
    .filter(reg => {
      const id = reg.isTeam ? reg.memberIds[0] : reg.id;
      return parseInt(scores[id]) || 0 > 0;
    })
    .slice(0, 3);

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ 
          bgcolor: "#FFF8E1", 
          fontFamily: '"Poppins", sans-serif' 
        }}
      >
        <CircularProgress sx={{ color: "#C62828" }} />
      </Box>
    );
  }

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
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToAdmin}
            sx={{ 
              color: "#C62828", 
              mr: 2,
              "&:hover": {
                backgroundColor: "rgba(198, 40, 40, 0.1)",
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            sx={{
              flexGrow: 1,
              color: "#C62828",
              fontFamily: "'Keania One', sans-serif",
              fontSize: { xs: "1.2rem", sm: "1.8rem", md: "2.2rem" },
              userSelect: "none",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            🏆 Pongal Score Management
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              icon={<GroupIcon />}
              label={`Teams: ${registrations.filter(r => r.isTeam).length}`}
              size="small"
              sx={{
                backgroundColor: "#FFD54F",
                color: "#5D4037",
                fontWeight: "bold",
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                display: { xs: "none", sm: "flex" }
              }}
            />
            <Chip
              label={`Total: ${filteredRegistrations.length}`}
              color="primary"
              variant="outlined"
              sx={{ 
                fontSize: { xs: "0.8rem", sm: "0.8rem" },
                height: { xs: 32, sm: 32 },
                borderColor: "#C62828",
                color: "#C62828",
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: "#FFF8E1",
          minHeight: "90vh",
          fontFamily: '"Poppins", sans-serif',
          overflow: "hidden",
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              fontFamily: "inherit",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              backgroundColor: "#FFEBEE",
              color: "#C62828",
              borderLeft: "4px solid #C62828",
            }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
              fontFamily: "inherit",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              backgroundColor: "#E8F5E9",
              color: "#2E7D32",
              borderLeft: "4px solid #4CAF50",
            }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        {/* Search Box */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            borderRadius: 3,
            bgcolor: "#FFFDE7",
            border: "2px solid #FFD54F",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, team, phone, or game..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#C62828" }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={clearSearch} 
                    size="small"
                    sx={{ color: "#C62828" }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                fontFamily: "inherit",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                color: "#5D4037",
              },
            }}
            sx={{
              fontFamily: "inherit",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#FFB300",
                },
                "&:hover fieldset": {
                  borderColor: "#C62828",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#C62828",
                },
              },
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.9rem", sm: "1rem" }
              }
            }}
          />
        </Paper>

        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 2,
            border: "3px solid",
            borderColor: "#C62828",
            bgcolor: "#FFFDE7",
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "#C62828",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              p: { xs: 1, sm: 1.5 },
              gap: 1,
            }}
          >
            {isMobile ? (
              <Select
                value={selectedTab}
                onChange={handleSelectChange}
                fullWidth
                size="small"
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  "& .MuiSelect-select": { 
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FFD54F",
                  },
                }}
              >
                {gameCategories.map((category, index) => (
                  <MenuItem
                    key={index}
                    value={index}
                    sx={{
                      fontSize: "0.85rem",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {index > 0 && getGameTypeIcon(category)}
                    {category}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="game category tabs"
                sx={{
                  "& .MuiTab-root": {
                    color: "rgba(255, 255, 255, 0.9)",
                    fontFamily: "inherit",
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.9rem" },
                    minWidth: { xs: 80, sm: 140, md: 160 },
                    px: { xs: 0.5, sm: 2 },
                    textTransform: "none",
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  },
                  "& .Mui-selected": {
                    color: "#C62828",
                    backgroundColor: "#FFD54F",
                    borderRadius: 2,
                    fontWeight: "bold",
                  },
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                }}
              >
                {gameCategories.map((category, index) => (
                  <Tab
                    key={index}
                    icon={index > 0 ? getGameTypeIcon(category) : undefined}
                    iconPosition="start"
                    label={category}
                    id={`tab-${index}`}
                    aria-controls={`tabpanel-${index}`}
                  />
                ))}
              </Tabs>
            )}

            <Button
              onClick={() => setSaveAllDialogOpen(true)}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                mt: { xs: 1, sm: 0 },
                color: "#C62828",
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                fontWeight: 600,
                backgroundColor: "#FFD54F",
                textTransform: "none",
                borderRadius: 2,
                fontFamily: "inherit",
                px: { xs: 2, sm: 3 },
                "&:hover": {
                  backgroundColor: "#FFB300",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(198, 40, 40, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              💾 Save All Scores
            </Button>
          </Box>

          {gameCategories.map((category, index) => (
            <TabPanel key={index} value={selectedTab} index={index}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                mb={2}
                gap={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "inherit",
                      fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                      color: "#C62828",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {index > 0 && getGameTypeIcon(category)}
                    {category} - {filteredRegistrations.length} participant(s)
                  </Typography>
                  {index > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "inherit",
                        fontSize: { xs: "0.75rem", sm: "0.9rem" },
                        color: "#795548",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      <Chip
                        label={gameTypes[category]?.type}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.7rem",
                          backgroundColor: gameTypes[category]?.type === "team" ? "#C62828" : "#1976d2",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                      {gameTypes[category]?.type === "team" && (
                        <span>
                          ({gameTypes[category]?.minMembers}-{gameTypes[category]?.maxMembers} members)
                        </span>
                      )}
                    </Typography>
                  )}
                </Box>

                {topPerformers.length > 0 && (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "#FFF3E0",
                      border: "1px solid #FFD54F",
                      minWidth: { xs: "100%", sm: 250 },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: "inherit",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        color: "#5D4037",
                        fontWeight: 600,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <TrophyIcon fontSize="small" /> Top Performers
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {topPerformers.map((performer, idx) => {
                        const id = performer.isTeam ? performer.memberIds[0] : performer.id;
                        return (
                          <Box
                            key={id}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Typography
                              sx={{
                                fontFamily: "inherit",
                                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                color: "#5D4037",
                              }}
                            >
                              <span style={{ fontWeight: "bold", color: "#C62828" }}>
                                {idx + 1}.{" "}
                              </span>
                              {performer.isTeam ? performer.teamName : performer.name}
                            </Typography>
                            <Chip
                              label={scores[id] || "0"}
                              size="small"
                              sx={{
                                fontFamily: "inherit",
                                fontSize: "0.7rem",
                                backgroundColor: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : "#CD7F32",
                                color: idx === 0 ? "#5D4037" : "white",
                                fontWeight: "bold",
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                )}
              </Box>

              {filteredRegistrations.length === 0 ? (
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "#FFF3E0",
                    borderRadius: 3,
                    border: "2px dashed #FFB300",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "inherit",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      color: "#795548",
                    }}
                  >
                    {searchQuery
                      ? "🎯 No matching participants found"
                      : "📝 No participants found for this game"}
                  </Typography>
                </Paper>
              ) : (
                <TableContainer
                  component={Paper}
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: "auto",
                    maxWidth: "100%",
                    maxHeight: "55vh",
                    bgcolor: "#FFFDE7",
                    border: "2px solid #FFD54F",
                  }}
                >
                  <Table
                    sx={{
                      minWidth: 250,
                      "& .MuiTableCell-root": {
                        fontFamily: "inherit",
                        fontSize: { xs: "0.85rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.2 },
                        px: { xs: 0.8, sm: 1.5 },
                        borderBottom: "1px solid #FFECB3",
                      },
                    }}
                    aria-label="participants table"
                    stickyHeader
                  >
                    <TableHead sx={{ 
                      backgroundColor: "#C62828", 
                      color: "white",
                      position: "sticky", 
                      top: 0, 
                      zIndex: 1 
                    }}>
                      <TableRow>
                        <TableCell
                          sx={{
  backgroundColor: "#C62828", 
                      color: "white",                            fontWeight: "bold",
                            width: 60,
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                          }}
                        >
                          S.No
                        </TableCell>
                        <TableCell
                          sx={{
  backgroundColor: "#C62828", 
                      color: "white",                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                          }}
                        >
                          Participant / Team
                        </TableCell>
                        {!isMobile && (
                          <TableCell
                            sx={{
  backgroundColor: "#C62828", 
                      color: "white",                              fontWeight: "bold",
                              fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            }}
                          >
                            Type
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
  backgroundColor: "#C62828", 
                      color: "white",                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                          }}
                        >
                          Score
                        </TableCell>
                        <TableCell
                          sx={{
  backgroundColor: "#C62828", 
                      color: "white",                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                          }}
                        >
                          Prize
                        </TableCell>
                        <TableCell
                          sx={{
  backgroundColor: "#C62828", 
                      color: "white",                            fontWeight: "bold",
                            width: 100,
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRegistrations.map((registration, index) => {
                        const id = registration.isTeam ? registration.memberIds[0] : registration.id;
                        return (
                          <React.Fragment key={id}>
                            <TableRow
                              sx={{
                                backgroundColor: registration.isTeam ? "#FFF3E0" : "inherit",
                                "&:hover": {
                                  backgroundColor: registration.isTeam ? "#FFECB3" : "#F5F5F5",
                                },
                              }}
                            >
                              <TableCell
                                sx={{ 
                                  fontSize: { xs: "0.85rem", sm: "0.875rem" },
                                  fontWeight: "bold",
                                  color: "#5D4037",
                                }}
                              >
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {registration.isTeam ? (
                                    <Badge
                                      badgeContent={registration.allMembers?.length}
                                      color="primary"
                                      sx={{
                                        "& .MuiBadge-badge": {
                                          backgroundColor: "#C62828",
                                          color: "white",
                                          fontSize: "0.7rem",
                                        }
                                      }}
                                    >
                                      <AvatarGroup max={3}>
                                        {registration.allMembers?.map((member, idx) => (
                                          <Avatar 
                                            key={idx}
                                            sx={{ 
                                              width: 32, 
                                              height: 32,
                                              bgcolor: "#FFD54F",
                                              color: "#5D4037",
                                              fontSize: "0.8rem",
                                            }}
                                          >
                                            {member.charAt(0).toUpperCase()}
                                          </Avatar>
                                        ))}
                                      </AvatarGroup>
                                    </Badge>
                                  ) : (
                                    <Avatar
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "#1976d2",
                                        color: "white",
                                        fontSize: "0.9rem",
                                      }}
                                    >
                                      {registration.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                  )}
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontFamily: "inherit",
                                        fontWeight: 600,
                                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                        color: "#5D4037",
                                      }}
                                    >
                                      {registration.isTeam ? registration.teamName : registration.name}
                                    </Typography>
                                    {isMobile && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                        <Chip
                                          label={registration.game}
                                          size="small"
                                          sx={{
                                            fontFamily: "inherit",
                                            fontSize: "0.7rem",
                                            height: 20,
                                            backgroundColor: registration.isTeam ? "#C62828" : "#1976d2",
                                            color: "white",
                                          }}
                                        />
                                        {registration.isTeam && (
                                          <IconButton
                                            size="small"
                                            onClick={() => toggleRowExpansion(id)}
                                            sx={{ p: 0, color: "#C62828" }}
                                          >
                                            {expandedRows[id] ? (
                                              <ExpandLessIcon fontSize="small" />
                                            ) : (
                                              <ExpandMoreIcon fontSize="small" />
                                            )}
                                          </IconButton>
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              {!isMobile && (
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Chip
                                      icon={registration.isTeam ? <GroupIcon /> : <PersonIcon />}
                                      label={registration.isTeam ? "Team" : "Individual"}
                                      size="small"
                                      sx={{
                                        fontFamily: "inherit",
                                        fontSize: "0.75rem",
                                        backgroundColor: registration.isTeam ? "#FFD54F" : "#1976d2",
                                        color: registration.isTeam ? "#5D4037" : "white",
                                      }}
                                    />
                                    {registration.isTeam && (
                                      <IconButton
                                        size="small"
                                        onClick={() => toggleRowExpansion(id)}
                                        sx={{ color: "#C62828" }}
                                      >
                                        {expandedRows[id] ? (
                                          <ExpandLessIcon fontSize="small" />
                                        ) : (
                                          <ExpandMoreIcon fontSize="small" />
                                        )}
                                      </IconButton>
                                    )}
                                  </Box>
                                </TableCell>
                              )}
                              <TableCell>
                                <TextField
                                  type="text"
                                  value={scores[id] || ""}
                                  onChange={(e) =>
                                    handleScoreChange(id, e.target.value)
                                  }
                                  inputProps={{
                                    maxLength: 4,
                                    style: {
                                      textAlign: "center",
                                      fontSize: isMobile ? "0.8rem" : "0.9rem",
                                      fontFamily: "inherit",
                                    },
                                  }}
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    width: 80,
                                    "& .MuiOutlinedInput-root": {
                                      "& fieldset": {
                                        borderColor: "#FFB300",
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "#C62828",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "#C62828",
                                      },
                                    },
                                    "& .MuiInputBase-input": {
                                      py: 1,
                                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                      color: "#5D4037",
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={prizes[id] !== "NONE" ? <TrophyIcon /> : null}
                                  label={getPrizeText(prizes[id] || "NONE")}
                                  variant={prizes[id] !== "NONE" ? "filled" : "outlined"}
                                  sx={{
                                    fontFamily: "inherit",
                                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                    backgroundColor: 
                                      prizes[id] === "FIRST" ? "#C62828" :
                                      prizes[id] === "SECOND" ? "#FF6F00" :
                                      prizes[id] === "THIRD" ? "#FFD54F" : "transparent",
                                    color: 
                                      prizes[id] === "FIRST" ? "white" :
                                      prizes[id] === "SECOND" ? "white" :
                                      prizes[id] === "THIRD" ? "#5D4037" : "#5D4037",
                                    borderColor: "#FFB300",
                                    borderWidth: prizes[id] === "NONE" ? 1 : 0,
                                    minWidth: 110,
                                    maxWidth: 130,
                                    "& .MuiChip-label": {
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" gap={1}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleSaveScore(registration)}
                                    disabled={saveStatus[id] === "saving"}
                                    startIcon={<SaveIcon />}
                                    sx={{
                                      fontFamily: "inherit",
                                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                      textTransform: "none",
                                      minWidth: "auto",
                                      px: 1.5,
                                      backgroundColor: "#C62828",
                                      "&:hover": {
                                        backgroundColor: "#B71C1C",
                                      },
                                      "&.Mui-disabled": {
                                        backgroundColor: "rgba(198, 40, 40, 0.5)",
                                      }
                                    }}
                                  >
                                    {saveStatus[id] === "saving" ? (
                                      <CircularProgress size={16} sx={{ color: "white" }} />
                                    ) : saveStatus[id] === "saved" ? (
                                      "Saved!"
                                    ) : saveStatus[id] === "error" ? (
                                      "Error"
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, registration)}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "#C62828",
                                      color: "#C62828",
                                      "&:hover": {
                                        backgroundColor: "rgba(198, 40, 40, 0.1)",
                                      }
                                    }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded row for team members */}
                            {registration.isTeam && expandedRows[id] && (
                              <TableRow>
                                <TableCell colSpan={isMobile ? 4 : 6} sx={{ bgcolor: "#FFF8E1", py: 2 }}>
                                  <Box sx={{ pl: { xs: 2, sm: 4 } }}>
                                    <Typography 
                                      variant="subtitle2" 
                                      sx={{ 
                                        fontFamily: "inherit", 
                                        fontWeight: "bold",
                                        color: "#C62828",
                                        mb: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <GroupIcon fontSize="small" />
                                      Team Members ({registration.allMembers?.length})
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                      {registration.memberData?.map((member, idx) => (
                                        <Paper
                                          key={member.id}
                                          elevation={1}
                                          sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            minWidth: 150,
                                            bgcolor: "white",
                                            border: "1px solid #FFD54F",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <Avatar
                                            sx={{
                                              width: 32,
                                              height: 32,
                                              bgcolor: "#FFD54F",
                                              color: "#5D4037",
                                              fontSize: "0.9rem",
                                            }}
                                          >
                                            {member.name.charAt(0).toUpperCase()}
                                          </Avatar>
                                          <Box>
                                            <Typography sx={{ 
                                              fontFamily: "inherit", 
                                              fontWeight: 500,
                                              fontSize: "0.875rem",
                                              color: "#5D4037",
                                            }}>
                                              {member.name}
                                            </Typography>
                                            {member.designation && (
                                              <Typography variant="caption" sx={{ color: "#795548", display: "block" }}>
                                                {member.designation}
                                              </Typography>
                                            )}
                                            <Typography variant="caption" sx={{ color: "#9E9E9E", display: "block", mt: 0.5 }}>
                                              {member.phone}
                                            </Typography>
                                          </Box>
                                        </Paper>
                                      ))}
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          ))}
        </Paper>
      </Box>

      {/* Prize Selection Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: "#FFFDE7",
            border: "1px solid #FFD54F",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const id = selectedParticipant?.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant?.id;
            handlePrizeChange(id, "NONE");
          }}
          selected={selectedParticipant && prizes[selectedParticipant.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant.id] === "NONE"}
          sx={{ 
            fontFamily: "inherit",
            color: "#5D4037",
            "&.Mui-selected": {
              backgroundColor: "#FFF3E0",
            }
          }}
        >
          No Prize
        </MenuItem>
        <MenuItem
          onClick={() => {
            const id = selectedParticipant?.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant?.id;
            handlePrizeChange(id, "FIRST");
          }}
          selected={selectedParticipant && prizes[selectedParticipant.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant.id] === "FIRST"}
          sx={{ 
            fontFamily: "inherit",
            color: "#C62828",
            fontWeight: "bold",
            "&.Mui-selected": {
              backgroundColor: "rgba(198, 40, 40, 0.1)",
            }
          }}
        >
          1st Prize 🥇
        </MenuItem>
        <MenuItem
          onClick={() => {
            const id = selectedParticipant?.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant?.id;
            handlePrizeChange(id, "SECOND");
          }}
          selected={selectedParticipant && prizes[selectedParticipant.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant.id] === "SECOND"}
          sx={{ 
            fontFamily: "inherit",
            color: "#FF6F00",
            fontWeight: "bold",
            "&.Mui-selected": {
              backgroundColor: "rgba(255, 111, 0, 0.1)",
            }
          }}
        >
          2nd Prize 🥈
        </MenuItem>
        <MenuItem
          onClick={() => {
            const id = selectedParticipant?.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant?.id;
            handlePrizeChange(id, "THIRD");
          }}
          selected={selectedParticipant && prizes[selectedParticipant.isTeam ? selectedParticipant.memberIds[0] : selectedParticipant.id] === "THIRD"}
          sx={{ 
            fontFamily: "inherit",
            color: "#FFD54F",
            fontWeight: "bold",
            "&.Mui-selected": {
              backgroundColor: "rgba(255, 213, 79, 0.1)",
            }
          }}
        >
          3rd Prize 🥉
        </MenuItem>
      </Menu>

      {/* Save All Confirmation Dialog */}
      <Dialog
        open={saveAllDialogOpen}
        onClose={() => setSaveAllDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: "#FFFDE7",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#C62828",
            color: "white",
            fontFamily: "inherit",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <Typography
            variant="h6"
            component="span"
            fontFamily="inherit"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Confirm Save All Scores
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setSaveAllDialogOpen(false)}
            sx={{ color: "white" }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, fontFamily: "inherit", mt: 2 }}>
          <Typography
            fontFamily="inherit"
            sx={{ 
              fontSize: { xs: "0.9rem", sm: "1rem" },
              color: "#5D4037",
              textAlign: "center",
            }}
          >
            Are you sure you want to save all scores for{" "}
            <strong style={{ color: "#C62828" }}>
              {filteredRegistrations.length}
            </strong>{" "}
            participants?
            <br />
            <Typography variant="body2" sx={{ mt: 1, color: "#795548" }}>
              This includes {registrations.filter(r => r.isTeam).length} teams and{" "}
              {registrations.filter(r => !r.isTeam).length} individuals.
            </Typography>
          </Typography>
        </DialogContent>
        <Divider sx={{ borderColor: "#FFD54F" }} />
        <DialogActions sx={{ p: 2, bgcolor: "#FFF3E0" }}>
          <Button
            onClick={() => setSaveAllDialogOpen(false)}
            variant="outlined"
            sx={{
              fontFamily: "inherit",
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.85rem", sm: "1rem" },
              borderColor: "#C62828",
              color: "#C62828",
              "&:hover": {
                borderColor: "#B71C1C",
                backgroundColor: "rgba(198, 40, 40, 0.04)",
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAllScores}
            variant="contained"
            sx={{
              fontFamily: "inherit",
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.85rem", sm: "1rem" },
              backgroundColor: "#C62828",
              "&:hover": {
                backgroundColor: "#B71C1C",
              }
            }}
          >
            Save All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Back Button for small screens */}
      {isMobile && (
        <Fab
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 1000,
            backgroundColor: "#C62828",
            color: "white",
            "&:hover": {
              backgroundColor: "#B71C1C",
            },
          }}
          aria-label="back to admin"
          onClick={handleBackToAdmin}
        >
          <ArrowBackIcon />
        </Fab>
      )}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Keania+One&display=swap');
          
          body {
            background: linear-gradient(135deg, #FFFDE7 0%, #FFF3E0 100%);
            min-height: 100vh;
          }
        `}
      </style>
    </>
  );
}