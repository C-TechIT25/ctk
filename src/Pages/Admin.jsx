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
  Collapse,
  Avatar,
  AvatarGroup,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
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
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { useNavigate } from "react-router-dom";

// Pongal game categories
const gameCategories = [
  "All Registrations",
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
    teamName: "",
    teamMembers: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
      const registrationsData = [];
      
      // Group team registrations
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

  const toggleRowExpansion = (registrationId) => {
    setExpandedRows(prev => ({
      ...prev,
      [registrationId]: !prev[registrationId]
    }));
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
        const searchFields = [
          reg.name?.toLowerCase(),
          reg.designation?.toLowerCase(),
          reg.phone?.toLowerCase(),
          reg.game?.toLowerCase(),
          reg.teamName?.toLowerCase(),
        ];
        
        // Also search team members if it's a team
        if (reg.isTeam && reg.allMembers) {
          reg.allMembers.forEach(member => {
            searchFields.push(member.toLowerCase());
          });
        }
        
        return searchFields.some(field => field && field.includes(query));
      }
      
      return true;
    });

  const handleEditClick = (registration) => {
    setCurrentRegistration(registration);
    setEditFormData({
      name: registration.name,
      designation: registration.designation || "",
      phone: registration.phone,
      game: registration.game,
      teamName: registration.teamName || "",
      teamMembers: registration.allMembers || [registration.name],
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
      
      if (currentRegistration.isTeam) {
        // For team registrations, update all team members
        const updates = currentRegistration.memberData.map((member, index) => {
          const docRef = doc(db, "registrations", member.id);
          return updateDoc(docRef, {
            ...editFormData,
            name: editFormData.teamMembers[index] || member.name
          });
        });
        await Promise.all(updates);
      } else {
        // For individual registration
        const docRef = doc(db, "registrations", currentRegistration.id);
        await updateDoc(docRef, editFormData);
      }
      
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
      
      if (currentRegistration.isTeam) {
        // Delete all team members
        const deletions = currentRegistration.memberIds.map(id => 
          deleteDoc(doc(db, "registrations", id))
        );
        await Promise.all(deletions);
      } else {
        // Delete individual registration
        await deleteDoc(doc(db, "registrations", currentRegistration.id));
      }
      
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

  const handleScore = () => {
    navigate("/score");
  };

  const handleSelectChange = (event) => {
    handleTabChange(null, event.target.value);
  };

  const getGameTypeIcon = (game) => {
    const gameType = gameTypes[game]?.type;
    return gameType === "team" ? <GroupIcon fontSize="small" /> : <PersonIcon fontSize="small" />;
  };

  const getGameTypeColor = (game) => {
    const gameType = gameTypes[game]?.type;
    return gameType === "team" ? "#C62828" : "#1976d2";
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: "background.default", fontFamily: '"Poppins", sans-serif' }}
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
            onClick={handleBackToGames}
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
            🎉 Pongal Admin Dashboard
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
              icon={<PersonIcon />}
              label={`Individuals: ${registrations.filter(r => !r.isTeam).length}`}
              size="small"
              sx={{
                backgroundColor: "#C62828",
                color: "white",
                fontWeight: "bold",
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                display: { xs: "none", sm: "flex" }
              }}
            />
            <Chip
              label={`Total: ${registrations.length}`}
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

      <Box sx={{ 
        width: "100%", 
        p: { xs: 1, sm: 2, md: 3 },
        bgcolor: "#FFF8E1",
        minHeight: "90vh",
        maxHeight: "90vh",
        overflow: "hidden",
        fontFamily: '"Poppins", sans-serif'
      }}>
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
            placeholder="Search by name, phone, team, or game..."
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
              }
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

        <Paper elevation={3} sx={{ 
          borderRadius: 3, 
          overflow: "hidden", 
          mb: 2,
          border: "3px solid",
          borderColor: "#C62828",
          bgcolor: "#FFFDE7",
        }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: "divider", 
            bgcolor: "#C62828",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            flexWrap: "wrap", 
            p: { xs: 1, sm: 1.5 },
            gap: 1,
          }}>
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
                      color: index === 0 ? "#C62828" : "inherit",
                    }}
                  >
                    {index > 0 && getGameTypeIcon(category)}
                    {category}
                    {index > 0 && (
                      <Chip
                        label={gameTypes[category]?.type === "team" ? "Team" : "Ind"}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 16,
                          fontSize: "0.6rem",
                          backgroundColor: gameTypes[category]?.type === "team" ? "#FFD54F" : "#1976d2",
                          color: gameTypes[category]?.type === "team" ? "#5D4037" : "white",
                        }}
                      />
                    )}
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
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <span>{category}</span>
                        {index > 0 && (
                          <Chip
                            label={gameTypes[category]?.type === "team" ? "Team" : "Ind"}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: "0.6rem",
                              backgroundColor: gameTypes[category]?.type === "team" ? "#ffffff" : "#1976d2",
                              color: gameTypes[category]?.type === "team" ? "#5D4037" : "white",
                            }}
                          />
                        )}
                      </Box>
                    }
                    id={`tab-${index}`}
                    aria-controls={`tabpanel-${index}`}
                  />
                ))}
              </Tabs>
            )}
            <Button
              onClick={handleScore}
              sx={{ 
                mt: {xs: 1, sm: 0},
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
              🏆 Mark Score
            </Button>
          </Box>

          {gameCategories.map((category, index) => (
            <TabPanel key={index} value={selectedTab} index={index}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: "inherit",
                  fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                  color: "#C62828",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                {index > 0 && getGameTypeIcon(category)}
                {category} - {filteredRegistrations.length} registration(s)
                {index > 0 && (
                  <Chip
                    label={gameTypes[category]?.type}
                    size="small"
                    sx={{
                      backgroundColor: gameTypes[category]?.type === "team" ? "#C62828" : "#1976d2",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </Typography>

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
                  <Typography sx={{ 
                    fontFamily: "inherit", 
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    color: "#795548",
                  }}>
                    {searchQuery ? "🎯 No matching registrations found" : "📝 No registrations yet for this game"}
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
                    maxHeight: "60vh",
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
                      }
                    }} 
                    aria-label="registrations table"
                  >
                    <TableHead sx={{ bgcolor: "#C62828", position: "sticky", top: 0, zIndex: 1 }}>
                      <TableRow>
                        <TableCell sx={{ 
                          color: "white", 
                          fontWeight: "bold", 
                          width: 60,
                          fontSize: { xs: "0.85rem", sm: "0.875rem" },
                        }}>
                          #
                        </TableCell>
                        <TableCell sx={{ 
                          color: "white", 
                          fontWeight: "bold",
                          fontSize: { xs: "0.85rem", sm: "0.875rem" },
                        }}>
                          Participant / Team
                        </TableCell>
                        {!isMobile && (
                          <TableCell sx={{ 
                            color: "white", 
                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                          }}>
                            Contact
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell sx={{ 
                            color: "white", 
                            fontWeight: "bold",
                            fontSize: { xs: "0.85rem", sm: "0.875rem" },
                          }}>
                            Type
                          </TableCell>
                        )}
                        <TableCell sx={{ 
                          color: "white", 
                          fontWeight: "bold", 
                          width: 100,
                          fontSize: { xs: "0.85rem", sm: "0.875rem" },
                        }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRegistrations.map((registration, index) => (
                        <React.Fragment key={registration.id || registration.memberIds?.[0]}>
                          <TableRow
                            sx={{
                              backgroundColor: registration.isTeam ? "#FFF3E0" : "inherit",
                              "&:hover": {
                                backgroundColor: registration.isTeam ? "#FFECB3" : "#F5F5F5",
                              },
                            }}
                          >
                            <TableCell sx={{ 
                              fontSize: { xs: "0.85rem", sm: "0.875rem" },
                              fontWeight: "bold",
                              color: "#5D4037",
                            }}>
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
                                  <Typography sx={{ 
                                    fontFamily: "inherit", 
                                    fontWeight: 600,
                                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                    color: "#5D4037",
                                  }}>
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
                                          backgroundColor: getGameTypeColor(registration.game),
                                          color: "white",
                                        }}
                                      />
                                      {registration.isTeam && (
                                        <IconButton
                                          size="small"
                                          onClick={() => toggleRowExpansion(registration.memberIds?.[0])}
                                          sx={{ p: 0 }}
                                        >
                                          {expandedRows[registration.memberIds?.[0]] ? (
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
                              <TableCell sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                                <Typography sx={{ color: "#5D4037" }}>
                                  {registration.phone}
                                </Typography>
                                {registration.designation && (
                                  <Typography variant="caption" sx={{ color: "#795548", display: "block" }}>
                                    {registration.designation}
                                  </Typography>
                                )}
                              </TableCell>
                            )}
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
                                  <Chip
                                    label={registration.game}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontFamily: "inherit",
                                      fontSize: "0.75rem",
                                      borderColor: getGameTypeColor(registration.game),
                                      color: getGameTypeColor(registration.game),
                                    }}
                                  />
                                  {registration.isTeam && (
                                    <IconButton
                                      size="small"
                                      onClick={() => toggleRowExpansion(registration.memberIds?.[0])}
                                    >
                                      {expandedRows[registration.memberIds?.[0]] ? (
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
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleEditClick(registration)}
                                  aria-label="edit"
                                  sx={{ 
                                    backgroundColor: "#E3F2FD",
                                    "&:hover": { backgroundColor: "#BBDEFB" }
                                  }}
                                >
                                  <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteClick(registration)}
                                  aria-label="delete"
                                  sx={{ 
                                    backgroundColor: "#FFEBEE",
                                    "&:hover": { backgroundColor: "#FFCDD2" }
                                  }}
                                >
                                  <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded row for team members */}
                          {registration.isTeam && expandedRows[registration.memberIds?.[0]] && (
                            <TableRow>
                              <TableCell colSpan={isMobile ? 3 : 5} sx={{ bgcolor: "#FFF8E1", py: 2 }}>
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
                                        }}
                                      >
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
                                      </Paper>
                                    ))}
                                  </Box>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
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
        maxWidth="md"
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {currentRegistration?.isTeam ? <GroupIcon /> : <PersonIcon />}
            <Typography variant="h6" component="span" fontFamily="inherit" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Edit {currentRegistration?.isTeam ? "Team" : ""} Registration
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: "white" }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, fontFamily: "inherit", mt: 2 }}>
          {currentRegistration?.isTeam ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Team Name"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormData.teamName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, teamName: e.target.value })
                }
                sx={{ 
                  mt: 1, 
                  fontFamily: "inherit",
                  "& .MuiInputLabel-root": { fontSize: { xs: "0.9rem", sm: "1rem" } },
                  "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#FFB300" },
                    "&:hover fieldset": { borderColor: "#C62828" },
                    "&.Mui-focused fieldset": { borderColor: "#C62828" },
                  }
                }}
              />
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: "#5D4037", fontWeight: "bold" }}>
                Team Members
              </Typography>
              {editFormData.teamMembers?.map((member, index) => (
                <TextField
                  key={index}
                  margin="dense"
                  label={`Member ${index + 1}`}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={member}
                  onChange={(e) => {
                    const newMembers = [...editFormData.teamMembers];
                    newMembers[index] = e.target.value;
                    setEditFormData({ ...editFormData, teamMembers: newMembers });
                  }}
                  sx={{ 
                    fontFamily: "inherit",
                    "& .MuiInputLabel-root": { fontSize: { xs: "0.9rem", sm: "1rem" } },
                    "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#FFB300" },
                      "&:hover fieldset": { borderColor: "#C62828" },
                      "&.Mui-focused fieldset": { borderColor: "#C62828" },
                    }
                  }}
                />
              ))}
            </>
          ) : (
            <>
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
                  "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#FFB300" },
                    "&:hover fieldset": { borderColor: "#C62828" },
                    "&.Mui-focused fieldset": { borderColor: "#C62828" },
                  }
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
                  "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#FFB300" },
                    "&:hover fieldset": { borderColor: "#C62828" },
                    "&.Mui-focused fieldset": { borderColor: "#C62828" },
                  }
                }}
              />
            </>
          )}
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
              "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FFB300" },
                "&:hover fieldset": { borderColor: "#C62828" },
                "&.Mui-focused fieldset": { borderColor: "#C62828" },
              }
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
              "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "1rem" } },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FFB300" },
                "&:hover fieldset": { borderColor: "#C62828" },
                "&.Mui-focused fieldset": { borderColor: "#C62828" },
              }
            }}
          >
            {gameCategories.slice(1).map((game) => (
              <option key={game} value={game}>
                {game} ({gameTypes[game]?.type})
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#FFF3E0" }}>
          <Divider sx={{ width: "100%", mb: 2, borderColor: "#FFD54F" }} />
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            variant="outlined"
            sx={{ 
              fontFamily: "inherit", 
              borderRadius: 2,
               minWidth: 100,
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
            onClick={handleEditSubmit} 
            variant="contained" 
            sx={{ 
              fontFamily: "inherit", 
              borderRadius: 2,
              textTransform: "none",
              minWidth: 170,
              fontSize: { xs: "0.85rem", sm: "1rem" },
              backgroundColor: "#C62828",
              "&:hover": {
                backgroundColor: "#B71C1C",
              }
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
          <Typography fontFamily="inherit" sx={{ 
            fontSize: { xs: "0.9rem", sm: "1rem" },
            color: "#5D4037",
            textAlign: "center",
          }}>
            Are you sure you want to delete the registration for{" "}
            <strong style={{ color: "#C62828" }}>
              {currentRegistration?.isTeam ? currentRegistration.teamName : currentRegistration?.name}
            </strong>{" "}
            for the game{" "}
            <strong style={{ color: "#C62828" }}>{currentRegistration?.game}</strong>?
            {currentRegistration?.isTeam && (
              <Typography variant="body2" sx={{ mt: 1, color: "#795548" }}>
                This will delete {currentRegistration.allMembers?.length} team member(s).
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <Divider sx={{ borderColor: "#FFD54F" }} />
        <DialogActions sx={{ p: 2, bgcolor: "#FFF3E0" }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
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
            onClick={handleDeleteConfirm}
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
            Delete
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
          aria-label="back to games"
          onClick={handleBackToGames}
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