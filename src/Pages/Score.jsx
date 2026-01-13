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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { useNavigate } from "react-router-dom";

// Game categories (same as in Admin page)
const gameCategories = [
  "All Games",
  "Lemon balance race",
  "Straw Juice",
  "Act & guess",
  "Quiz",
  "Target Loss",
  "Hidden match",
  "Basket ball",
  "Balloon blast",
];

// Prize options
const prizeOptions = {
  NONE: "No Prize",
  FIRST: "1st Prize",
  SECOND: "2nd Prize",
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
      const registrationsData = [];
      querySnapshot.forEach((doc) => {
        registrationsData.push({ id: doc.id, ...doc.data() });
      });
      setRegistrations(registrationsData);

      // Initialize scores from existing data or set to empty
      const initialScores = {};
      const initialPrizes = {};
      
      registrationsData.forEach((reg) => {
        initialScores[reg.id] = reg.score || "";
        initialPrizes[reg.id] = reg.prize || "NONE";
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
    setSearchQuery(""); // Clear search when changing tabs
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

  const handleScoreChange = (id, value) => {
    // Allow only numbers and empty string
    if (value === "" || /^\d+$/.test(value)) {
      setScores((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handlePrizeChange = async (id, prizeValue) => {
    try {
      setPrizes((prev) => ({ ...prev, [id]: prizeValue }));
      
      const docRef = doc(db, "registrations", id);
      await updateDoc(docRef, { prize: prizeValue });
      
      setSuccess("Prize updated successfully");
      setTimeout(() => setSuccess(""), 3000);
      handleMenuClose();
    } catch (error) {
      console.error("Error updating prize: ", error);
      setError("Failed to update prize");
    }
  };

  const handleSaveScore = async (id) => {
    try {
      setSaveStatus((prev) => ({ ...prev, [id]: "saving" }));
      const docRef = doc(db, "registrations", id);
      await updateDoc(docRef, { 
        score: parseInt(scores[id]) || 0,
        prize: prizes[id] || "NONE"
      });

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
      setSaveStatus((prev) => ({ ...prev, [id]: "error" }));
      setError("Failed to save score");
    }
  };

  const handleSaveAllScores = async () => {
    try {
      setSaveAllDialogOpen(false);
      setLoading(true);

      const updatePromises = Object.keys(scores).map((id) => {
        const docRef = doc(db, "registrations", id);
        return updateDoc(docRef, { 
          score: parseInt(scores[id]) || 0,
          prize: prizes[id] || "NONE"
        });
      });

      await Promise.all(updatePromises);

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
      default: return "default";
    }
  };

  const getPrizeText = (prize) => {
    return prizeOptions[prize] || prizeOptions.NONE;
  };

  const filteredRegistrations = registrations
    .filter((reg) => {
      // Filter by selected tab
      if (selectedTab !== 0 && reg.game !== gameCategories[selectedTab]) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          reg.name.toLowerCase().includes(query) ||
          reg.email.toLowerCase().includes(query) ||
          reg.phone.toLowerCase().includes(query) ||
          reg.game.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by score descending, then by name ascending
      const scoreA = parseInt(scores[a.id]) || 0;
      const scoreB = parseInt(scores[b.id]) || 0;

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      return a.name.localeCompare(b.name);
    });

  // Get top 2 performers
  const topPerformers = filteredRegistrations
    .filter((reg) => parseInt(scores[reg.id]) || 0 > 0)
    .slice(0, 2);

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
        sx={{ bgcolor: "background.default" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "white", color: "text.primary", py: 1 }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToAdmin}
            sx={{ color: "primary.main", mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="700"
            sx={{
              flexGrow: 1,
              color: "primary.main",
              fontFamily: "Keania One",
              fontSize: { xs: "1rem", sm: "1.8rem", md: "2.2rem" },
              userSelect: "none",
              ml: { xs: -2, sm: 1 },
            }}
          >
            Score Management
          </Typography>
          <Chip
            label={`Participants: ${filteredRegistrations.length}`}
            color="primary"
            variant="outlined"
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.8rem" },
              height: { xs: 32, sm: 32 },
            }}
          />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          p: { xs: 1, sm: 2 },
          bgcolor: "background.default",
          minHeight: "90vh",
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              fontFamily: "inherit",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
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
            }}
          >
            {success}
          </Alert>
        )}

        {/* Search Box */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search participants..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                fontFamily: "inherit",
                fontSize: { xs: "0.9rem", sm: "1rem" },
              },
            }}
            sx={{
              fontFamily: "inherit",
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.9rem", sm: "1rem" },
              },
            }}
          />
        </Paper>

        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            mb: 2,
            border: "3px solid",
            borderColor: "primary.main",
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              p: { xs: 1, sm: 1.5 },
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
                  borderRadius: 1,
                  fontSize: "0.85rem",
                  "& .MuiSelect-select": { py: 1 },
                }}
              >
                {gameCategories.map((category, index) => (
                  <MenuItem
                    key={index}
                    value={index}
                    sx={{ fontSize: "0.85rem", fontFamily: "inherit" }}
                  >
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
                    color: "rgba(255, 255, 255, 1)",
                    fontFamily: "inherit",
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    minWidth: { xs: 70, sm: 120 },
                    px: { xs: 0.5, sm: 2 },
                  },
                  "& .Mui-selected": {
                    color: "primary.main",
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    borderRadius: 2,
                  },
                }}
              >
                {gameCategories.map((category, index) => (
                  <Tab
                    key={index}
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
                ml: { xs: 0, sm: 2 },
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                textTransform: "none",
                borderRadius: 2,
                fontFamily: "inherit",
              }}
            >
              Save All Scores
            </Button>
          </Box>

          {gameCategories.map((category, index) => (
            <TabPanel key={index} value={selectedTab} index={index}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                mb={2}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "inherit",
                    fontSize: { xs: ".8rem", sm: "1.25rem" },
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                >
                  {category} - {filteredRegistrations.length} participant(s)
                </Typography>

                {topPerformers.length > 0 && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "inherit",
                        fontSize: { xs: "0.7rem", sm: "0.9rem" },
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      Top Performers:
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5}>
                      {topPerformers.map((performer, idx) => (
                        <Chip
                          key={performer.id}
                          label={`${idx + 1}. ${performer.name} (${
                            scores[performer.id] || 0
                          })`}
                          color="primary"
                          size="small"
                          variant="outlined"
                          sx={{
                            fontFamily: "inherit",
                            fontSize: { xs: "0.6rem", sm: "0.7rem" },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              {filteredRegistrations.length === 0 ? (
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "inherit",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {searchQuery
                      ? "No matching participants found"
                      : "No participants found"}
                  </Typography>
                </Paper>
              ) : (
                <TableContainer
                  component={Paper}
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    overflow: "auto",
                    maxWidth: "100%",
                    maxHeight: "55vh",
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
                      },
                    }}
                    aria-label="participants table"
                    stickyHeader
                  >
                    <TableHead sx={{ backgroundColor: "red" }}>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            width: 60,
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            backgroundColor: "primary.main",
                          }}
                        >
                          S.No
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            backgroundColor: "primary.main",
                          }}
                        >
                          Name
                        </TableCell>
                        {!isMobile && (
                          <TableCell
                            sx={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: { xs: "0.85rem", sm: "0.875rem" },
                              backgroundColor: "primary.main",
                            }}
                          >
                            Game
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            backgroundColor: "primary.main",
                          }}
                        >
                          Score
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            backgroundColor: "primary.main",
                          }}
                        >
                          Prize
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            width: 100,
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            backgroundColor: "primary.main",
                          }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRegistrations.map((registration, index) => (
                        <TableRow
                          key={registration.id}
                          sx={{
                            "&:nth-of-type(odd)": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <TableCell
                            sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
                          >
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography
                                sx={{
                                  fontFamily: "inherit",
                                  fontWeight: 500,
                                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                                }}
                              >
                                {registration.name}
                              </Typography>
                              {isMobile && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: "inherit",
                                    color: "text.secondary",
                                    display: "block",
                                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                  }}
                                >
                                  {registration.game}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          {!isMobile && (
                            <TableCell>
                              <Chip
                                label={registration.game}
                                color="primary"
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontFamily: "inherit",
                                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <TextField
                              type="text"
                              value={scores[registration.id] || ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  registration.id,
                                  e.target.value
                                )
                              }
                              inputProps={{
                                maxLength: 4,
                                style: {
                                  textAlign: "center",
                                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                                },
                              }}
                              variant="outlined"
                              size="small"
                              sx={{
                                width: 80,
                                "& .MuiInputBase-input": {
                                  py: 1,
                                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={prizes[registration.id] !== "NONE" ? <TrophyIcon color="white" /> : null}
                              label={getPrizeText(prizes[registration.id] || "NONE")}
                              color={getPrizeColor(prizes[registration.id] || "NONE") !== "default" ? "default" : "default"}
                              variant={prizes[registration.id] !== "NONE" ? "filled" : "outlined"}
                              sx={{
                                // backgroundColor: getPrizeColor(prizes[registration.id] || "NONE"),
                                color: prizes[registration.id] !== "NONE" ? "white" : "inherit",
                                fontFamily: "inherit",
                                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                backgroundColor: prizes[registration.id] === "FIRST" ? "#6f9114ff" : prizes[registration.id] === "SECOND" ? "#0f7385ff" : "inherit",
                                minWidth: 110,
                                                                boxShadow: "0px 4px 3px black",

                                maxWidth: 100,
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
                                onClick={() => handleSaveScore(registration.id)}
                                disabled={
                                  saveStatus[registration.id] === "saving"
                                }
                                sx={{
                                  fontFamily: "inherit",
                                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                  textTransform: "none",
                                  minWidth: "auto",
                                  px: 1,
                                }}
                              >
                                {saveStatus[registration.id] === "saving" ? (
                                  <CircularProgress size={16} />
                                ) : saveStatus[registration.id] === "saved" ? (
                                  "Saved!"
                                ) : saveStatus[registration.id] === "error" ? (
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
                                  borderColor: "primary.main",
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
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
          },
        }}
      >
        <MenuItem
          onClick={() => handlePrizeChange(selectedParticipant.id, "NONE")}
          selected={prizes[selectedParticipant?.id] === "NONE"}
          sx={{ fontFamily: "inherit" }}
        >
          No Prize
        </MenuItem>
        <MenuItem
          onClick={() => handlePrizeChange(selectedParticipant.id, "FIRST")}
          selected={prizes[selectedParticipant?.id] === "FIRST"}
          sx={{ fontFamily: "inherit" }}
        >
          1st Prize
        </MenuItem>
        <MenuItem
          onClick={() => handlePrizeChange(selectedParticipant.id, "SECOND")}
          selected={prizes[selectedParticipant?.id] === "SECOND"}
          sx={{ fontFamily: "inherit" }}
        >
          2nd Prize
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
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
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
            backgroundColor: "primary.main",
            color: "white",
            fontFamily: "inherit",
          }}
        >
          <Typography
            variant="h6"
            component="span"
            fontFamily="inherit"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Confirm Save All
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
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            Are you sure you want to save all scores for{" "}
            {filteredRegistrations.length} participants?
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setSaveAllDialogOpen(false)}
            sx={{
              fontFamily: "inherit",
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAllScores}
            variant="contained"
            color="primary"
            sx={{
              fontFamily: "inherit",
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Save All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Back Button for small screens */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="back to admin"
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 1000,
          }}
          onClick={handleBackToAdmin}
        >
          <ArrowBackIcon />
        </Fab>
      )}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Keania+One&display=swap');
        `}
      </style>
    </>
  );
}