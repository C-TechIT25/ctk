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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { useNavigate } from "react-router-dom";

// Game categories
const gameCategories = [
  "All Registrations",
  "Lemon balance race",
  "Straw Juice",
  "Act & guess",
  "Quiz",
  "Target Loss",
  "Hidden match",
  "Basket ball",
  "Balloon blast",
];

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
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

export default function Admin() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    designation: "",
    phone: "",
    game: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
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
          reg.designation.toLowerCase().includes(query) ||
          reg.phone.toLowerCase().includes(query) ||
          reg.game.toLowerCase().includes(query)
        );
      }
      
      return true;
    });

  const handleEditClick = (registration) => {
    setCurrentRegistration(registration);
    setEditFormData({
      name: registration.name,
      designation: registration.designation,
      phone: registration.phone,
      game: registration.game,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (registration) => {
    setCurrentRegistration(registration);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      setError("");
      const docRef = doc(db, "registrations", currentRegistration.id);
      await updateDoc(docRef, editFormData);
      setEditDialogOpen(false);
      setSuccess("Registration updated successfully");
      fetchRegistrations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating document: ", error);
      setError("Failed to update registration");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError("");
      await deleteDoc(doc(db, "registrations", currentRegistration.id));
      setDeleteDialogOpen(false);
      setSuccess("Registration deleted successfully");
      fetchRegistrations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting document: ", error);
      setError("Failed to delete registration");
    }
  };

  const handleBackToGames = () => {
    navigate("/");
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
    const handleSelectChange = (event) => {
    handleTabChange(null, event.target.value); // mimic Tabs onChange signature
  };


  const handleScore = () => {
    navigate("/score");
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
            onClick={handleBackToGames}
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
              ml: { xs: -2, sm: 1}
            }}
          >
            Admin Dashboard
          </Typography>
          <Chip
            label={`Total: ${registrations.length}`}
            color="primary"
            variant="outlined"
            sx={{ 
              fontSize: { xs: "0.8rem", sm: "0.8rem" },
              height: { xs: 32, sm: 32 }
            }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        width: "100%", 
        p: { xs: 1, sm: 2 },
        bgcolor: "background.default",
        minHeight: "90vh",
        maxHeight:"90vh",
        fontFamily: '"Poppins", sans-serif'
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: "inherit", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, fontFamily: "inherit", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
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
            bgcolor: "background.paper"
          }}
        >
          <TextField
            fullWidth
            placeholder="Search registrations..."
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
                fontSize: { xs: "0.9rem", sm: "1rem" }
              }
            }}
            sx={{ 
              fontFamily: "inherit",
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.9rem", sm: "1rem" }
              }
            }}
          />
        </Paper>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden", mb: 2 , border: "3px solid", borderColor: "primary.main"}}>
             <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "primary.main",display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", p: { xs: 1, sm: 1.5 } }}>
      {isMobile ? (
        // --- Mobile: Dropdown ---
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
            <MenuItem key={index} value={index} sx={{ fontSize: "0.85rem",fontFamily: "inherit" }}>
              {category}
            </MenuItem>
          ))}
        </Select>
      ) : (
        // --- Desktop: Tabs ---
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
                onClick={handleScore}
                sx={{ mt:{xs: 1, sm: 0}, ml: { xs: 0, sm: 2 }, color: "primary.main", fontSize: { xs: "0.7rem", sm: "1rem" }, Size: { xs: "0.9rem", sm: "1rem",color: "primary.main",}, fontWeight: 600,backgroundColor:"white", textTransform: "none", borderRadius: 2,fontFamily: "inherit" }}
              >

                Mark Score
              </Button>
    </Box>

          {gameCategories.map((category, index) => (
            <TabPanel key={index} value={selectedTab} index={index}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: "inherit",
                  fontSize: { xs: ".8rem", sm: "1.25rem" },
                  color: "primary.main",
                  fontWeight: 600
                }}
              >
                {category} - {filteredRegistrations.length} registration(s)

                
              </Typography>

           

              

              {filteredRegistrations.length === 0 ? (
                <Paper elevation={2} sx={{ p: 3, textAlign: "center", bgcolor: "background.default" }}>
                  <Typography sx={{ fontFamily: "inherit", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                    {searchQuery ? "No matching registrations found" : "No registrations found"}
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
                    maxHeight: "60vh",
                  }}
                >
                  <Table 
                    sx={{ 
                      minWidth: 250,
                      "& .MuiTableCell-root": {
                        fontFamily: "inherit",
                        fontSize: { xs: "0.85rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.2 },
                        px: { xs: 0.8, sm: 1.5 }
                      }
                    }} 
                    aria-label="registrations table"
                  >
                    <TableHead sx={{ bgcolor: "primary.main" }}>
                      <TableRow>
                        <TableCell sx={{ 
                          color: "white", 
                          fontWeight: "bold", 
                          width: 60,
                          fontSize: { xs: "0.85rem", sm: "0.875rem" } 
                        }}>
                          S.No
                        </TableCell>
                        <TableCell sx={{ 
                          color: "white", 
                          fontWeight: "bold",
                          fontSize: { xs: "0.85rem", sm: "0.875rem" } 
                        }}>
                          Name
                        </TableCell>
                        {!isMobile && (
                          <TableCell sx={{ 
                            color: "white", 
                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" } 
                          }}>
                            designation
                          </TableCell>
                        )}
                                                  {!isMobile && (

                        <TableCell sx={{ 
                          color: "white", 
                          fontWeight: "bold",
                          fontSize: { xs: "0.85rem", sm: "0.875rem" } 
                        }}>
                          Phone
                        </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell sx={{ 
                            color: "white", 
                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" } 
                          }}>
                            Game
                          </TableCell>
                        )}
                        <TableCell sx={{ 
                          color: "white", 
                          fontWeight: "bold", 
                          width: 100,
                          fontSize: { xs: "0.85rem", sm: "0.875rem" } 
                        }}>
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
                          <TableCell sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}>
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography sx={{ 
                                fontFamily: "inherit", 
                                fontWeight: 500,
                                fontSize: { xs: "0.7rem", sm: "0.875rem" }
                              }}>
                                {registration.name}
                              </Typography>
                              {isMobile && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontFamily: "inherit",
                                    color: "text.secondary",
                                    display: "block",
                                    fontSize: { xs: "0.7rem", sm: "0.8rem" }
                                  }}
                                >
                                  {registration.game}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          {!isMobile && (
                            <TableCell sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                              {registration.designation}
                            </TableCell>
                          )}
                          {!isMobile && (
                          <TableCell sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                            {registration.phone}
                          </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              <Chip
                                label={registration.game}
                                color="primary"
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontFamily: "inherit",
                                  fontSize: { xs: "0.7rem", sm: "0.8rem" }
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditClick(registration)}
                              aria-label="edit"
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(registration)}
                              aria-label="delete"
                            >
                              <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
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
          <Typography variant="h6" component="span" fontFamily="inherit" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Edit Registration
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "white" }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, fontFamily: "inherit", mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.name}
            onChange={(e) =>
              setEditFormData({ ...editFormData, name: e.target.value })
            }
            sx={{ 
              mt: 1, 
              fontFamily: "inherit",
              "& .MuiInputLabel-root": { fontSize: { xs: "0.9rem", sm: "1rem" } },
              "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } }
            }}
          />
          <TextField
            margin="dense"
            label="Designation"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.designation}
            onChange={(e) =>
              setEditFormData({ ...editFormData, designation: e.target.value })
            }
            sx={{ 
              fontFamily: "inherit",
              "& .MuiInputLabel-root": { fontSize: { xs: "0.9rem", sm: "1rem" } },
              "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } }
            }}
          />
          <TextField
            margin="dense"
            label="Phone"
            type="tel"
            fullWidth
            variant="outlined"
            value={editFormData.phone}
            onChange={(e) =>
              setEditFormData({ ...editFormData, phone: e.target.value })
            }
            sx={{ 
              fontFamily: "inherit",
              "& .MuiInputLabel-root": { fontSize: { xs: "0.9rem", sm: "1rem" } },
              "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } }
            }}
          />
          <TextField
            margin="dense"
            label="Game"
            select
            fullWidth
            variant="outlined"
            value={editFormData.game}
            onChange={(e) =>
              setEditFormData({ ...editFormData, game: e.target.value })
            }
            SelectProps={{
              native: true,
            }}
            sx={{ 
              fontFamily: "inherit",
              "& .MuiInputLabel-root": { fontSize: { xs: "0.9rem", sm: "1rem" } },
              "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } }
            }}
          >
            {gameCategories.slice(1).map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Divider />
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            sx={{ 
              fontFamily: "inherit", 
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.6rem", sm: "1rem" }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            sx={{ 
              fontFamily: "inherit", 
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.6rem", sm: "1rem" }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
            backgroundColor: "error.main",
            color: "white",
            fontFamily: "inherit",
          }}
        >
          <Typography variant="h6" component="span" fontFamily="inherit" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Confirm Delete
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "white" }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, fontFamily: "inherit", mt: 2 }}>
          <Typography fontFamily="inherit" sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            Are you sure you want to delete the registration for{" "}
            <strong>{currentRegistration?.name}</strong> for the game{" "}
            <strong>{currentRegistration?.game}</strong>?
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              fontFamily: "inherit", 
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", sm: "1rem" }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ 
              fontFamily: "inherit", 
              borderRadius: 2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", sm: "1rem" }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Back Button for small screens */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="back to games"
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 1000,
          }}
          onClick={handleBackToGames}
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