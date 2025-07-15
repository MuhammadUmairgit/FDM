import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Input,
  Table,
  Avatar,
  Typography,
  Space,
  Badge,
  Tag,
  Tabs,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Upload,
  message,
  Popconfirm,
  Drawer,
  Statistic,
  Divider,
  Select,
  Empty,
  Spin,
  FloatButton,
  Tooltip,
  Image,
  List,
  Progress,
  Switch,
  Alert,
  Dropdown,
  Menu,
  Timeline,
  Result,
  ConfigProvider,
  theme,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  PhoneOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  DollarOutlined,
  CameraOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  WhatsAppOutlined,
  MailOutlined,
  StarOutlined,
  StarFilled,
  CalendarOutlined,
  FileImageOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExportOutlined,
  PrinterOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  ContactsOutlined,
  TransactionOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  PayCircleOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  HomeOutlined,
  ShopOutlined,
  CreditCardOutlined,
  BankOutlined,
  SafetyOutlined,
  SecurityScanOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  MenuOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  LeftOutlined,
  RightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  FastBackwardOutlined,
  FastForwardOutlined,
  UpOutlined,
  DownOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  LoginOutlined,
  LogoutOutlined,
  QuestionOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  HeartOutlined,
  HeartFilled,
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  SendOutlined,
  SaveOutlined,
  CopyOutlined,
  ScissorOutlined,
  PaperClipOutlined,
  FolderOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileMarkdownOutlined,
  FileUnknownOutlined,
  FolderOpenOutlined,
  FolderAddOutlined,
  DatabaseOutlined,
  ServerOutlined,
  DesktopOutlined,
  LaptopOutlined,
  TabletOutlined,
  MobileOutlined,
  RobotOutlined,
  BugOutlined,
  CodeOutlined,
  ConsoleSqlOutlined,
  FunctionOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  AimOutlined,
  ScanOutlined,
  RadarChartOutlined,
  DotChartOutlined,
  FundOutlined,
  SlackOutlined,
  BehanceOutlined,
  DribbbleOutlined,
  InstagramOutlined,
  YuqueOutlined,
  AlibabaOutlined,
  YahooOutlined,
  RedditOutlined,
  SkypeOutlined,
  CodeSandboxOutlined,
  ChromeOutlined,
  AppleOutlined,
  AndroidOutlined,
  WindowsOutlined,
  IeOutlined,
  FirefoxOutlined,
  SafariOutlined,
  EdgeOutlined,
  OperaOutlined,
  AlertOutlined,
  WarningOutlined,
  StopOutlined,
  IssuesCloseOutlined,
  NodeIndexOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PicLeftOutlined,
  PicCenterOutlined,
  PicRightOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined as AppsOutlined,
  BgColorsOutlined,
  BorderOutlined,
  FormatPainterOutlined,
  HighlightOutlined,
  SmallDashOutlined,
  DashOutlined,
  LineOutlined,
  BorderHorizontalOutlined,
  BorderInnerOutlined,
  BorderOuterOutlined,
  BorderTopOutlined,
  BorderBottomOutlined,
  BorderLeftOutlined,
  BorderRightOutlined,
  BorderVerticleOutlined,
  TableOutlined,
  ReadOutlined,
  CloudServerOutlined,
  CloudSyncOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined as CloudUp,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  AntDesignOutlined,
  AntCloudOutlined,
  FormatOutlined,
  OneToOneOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwitcherOutlined,
  ExpandOutlined,
  CollapseOutlined,
  ExpandAltOutlined,
  CompressOutlined,
  ArrowsAltOutlined,
  ShrinkOutlined,
  FontSizeOutlined,
  FontColorsOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  BlockOutlined,
  ApartmentOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  AudioOutlined as SoundOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  PlayCircleOutlined,
  PlaySquareOutlined,
  PauseCircleOutlined,
  PauseOutlined,
  StopOutlined as StopIcon,
  StepBackwardOutlined as StepBackIcon,
  StepForwardOutlined as StepForwardIcon,
  ForwardOutlined,
  BackwardOutlined,
  CaretRightOutlined as PlayIcon,
  ToTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined as VerticalBottom,
  DragOutlined,
  BuildOutlined,
  ToolOutlined,
  ControlOutlined,
  ApiOutlined,
  DisconnectOutlined,
  LinkOutlined,
  BranchesOutlined as GitBranch,
  ForkOutlined,
  MergeCellsOutlined,
  PullRequestOutlined,
  PartitionOutlined,
  AuditOutlined,
  TruckOutlined,
  StockOutlined,
  InboxOutlined,
  CrownOutlined,
  DragOutlined as Drag,
  ExperimentOutlined,
  BellOutlined as Bell,
  NotificationOutlined,
  SoundOutlined as Sound,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusSettingOutlined,
  BorderlessTableOutlined,
  WifiOutlined,
  FunnelPlotOutlined,
  ThunderboltOutlined as Thunder,
  SelectOutlined,
  VerticalRightOutlined,
  VerticalLeftOutlined,
  RightSquareOutlined,
  LeftSquareOutlined,
  PlaySquareOutlined as PlaySquare,
  ControlOutlined as Control,
  PauseCircleOutlined as PauseCircle,
  PlayCircleOutlined as PlayCircle,
  BackwardOutlined as Backward,
  ForwardOutlined as Forward,
  EnterOutlined,
  RetweetOutlined,
  LoginOutlined as Login,
  LogoutOutlined as Logout,
  MenuOutlined as Menu,
  SwapLeftOutlined,
  SwapRightOutlined,
  SwapOutlined,
  SwitcherOutlined as Switcher,
  CalculatorOutlined as Calculator,
  HourglassOutlined,
  RestOutlined,
  UsbOutlined,
  GoldOutlined,
  SkinOutlined,
  VideoOutlined,
  PictureOutlined,
  GiftOutlined,
  FlagOutlined,
  LocationOutlined,
  CompassOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  FieldNumberOutlined,
  FieldStringOutlined,
  FieldBinaryOutlined,
  CarryOutOutlined,
  CarryOutFilled,
  CheckSquareOutlined,
  CheckSquareFilled,
  CloseSquareOutlined,
  CloseSquareFilled,
  BorderOutlined as Border,
  BarsOutlined,
  BookOutlined,
  ReconciliationOutlined,
  AccountBookOutlined,
  ContactsOutlined as Contacts,
  CaretDownFilled,
  CaretLeftFilled,
  CaretRightFilled,
  CaretUpFilled,
  LeftCircleOutlined,
  RightCircleOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  LeftCircleFilled,
  RightCircleFilled,
  UpCircleFilled,
  DownCircleFilled,
  LeftSquareFilled,
  RightSquareFilled,
  UpSquareFilled,
  DownSquareFilled,
  LeftSquareOutlined as LeftSquare,
  RightSquareOutlined as RightSquare,
  UpSquareOutlined,
  DownSquareOutlined,
  QuestionCircleOutlined,
  QuestionCircleFilled,
  PlusCircleFilled,
  MinusCircleFilled,
  InfoCircleFilled,
  ExclamationCircleFilled,
  CloseCircleFilled,
  CheckCircleFilled,
  WarningFilled,
  StopFilled,
  EditFilled,
  CopyFilled,
  DeleteFilled,
  SnippetsOutlined,
  DiffOutlined,
  HighlightFilled,
  PieChartFilled,
  BoxPlotOutlined,
  BoxPlotFilled,
  FundFilled,
  SlidersFilled,
  MacCommandOutlined,
  MacCommandFilled,
  UserOutlined as User,
  UserAddOutlined as UserAdd,
  UserSwitchOutlined as UserSwitch,
  UserDeleteOutlined,
  UsergroupDeleteOutlined as UsergroupDelete,
  UsergroupAddOutlined as UsergroupAdd,
  ManOutlined,
  WomanOutlined,
  ShopOutlined as Shop,
  ShoppingOutlined,
  ShoppingCartOutlined,
  ShoppingFilled,
  RocketOutlined,
  RocketFilled,
  PushpinOutlined,
  PushpinFilled,
  PhoneFilled,
  PhoneOutlined as Phone,
  CameraFilled,
  CameraOutlined as Camera,
  CameraTwoTone,
  VideoCameraFilled,
  VideoCameraOutlined as VideoCamera,
  MessageFilled,
  MessageOutlined as Message,
  MessageTwoTone,
  MailFilled,
  MailOutlined as Mail,
  MailTwoTone,
  HeartFilled as Heart,
  HeartOutlined as HeartOutline,
  HeartTwoTone,
  StarFilled as Star,
  StarOutlined as StarOutline,
  StarTwoTone,
  LikeFilled,
  LikeOutlined as Like,
  LikeTwoTone,
  DislikeFilled,
  DislikeOutlined as Dislike,
  DislikeTwoTone,
  SmileFilled,
  SmileOutlined as Smile,
  SmileTwoTone,
  FrownFilled,
  FrownOutlined as Frown,
  FrownTwoTone,
  MehFilled,
  MehOutlined as Meh,
  MehTwoTone,
  LockFilled,
  LockOutlined as Lock,
  LockTwoTone,
  UnlockFilled,
  UnlockOutlined as Unlock,
  UnlockTwoTone,
  EyeFilled,
  EyeOutlined as Eye,
  EyeTwoTone,
  EyeInvisibleFilled,
  EyeInvisibleOutlined as EyeInvisible,
  EyeInvisibleTwoTone,
  BellFilled,
  BellOutlined as BellOutline,
  BellTwoTone,
  BookFilled,
  BookOutlined as Book,
  BookTwoTone,
  CalendarFilled,
  CalendarOutlined as Calendar,
  CalendarTwoTone,
  CloudFilled,
  CloudOutlined,
  CloudTwoTone,
  CrownFilled,
  CrownOutlined as Crown,
  CrownTwoTone,
  DollarCircleFilled,
  DollarCircleOutlined,
  DollarCircleTwoTone,
  DollarOutlined as Dollar,
  DollarTwoTone,
  FileTextFilled,
  FileTextOutlined as FileText,
  FileTextTwoTone,
  FlagFilled,
  FlagOutlined as Flag,
  FlagTwoTone,
  FolderFilled,
  FolderOutlined as Folder,
  FolderTwoTone,
  FolderOpenFilled,
  FolderOpenOutlined as FolderOpen,
  FolderOpenTwoTone,
  FolderAddFilled,
  FolderAddOutlined as FolderAdd,
  FolderAddTwoTone,
  GiftFilled,
  GiftOutlined as Gift,
  GiftTwoTone,
  HomeFilled,
  HomeOutlined as Home,
  HomeTwoTone,
  TrophyFilled,
  TrophyOutlined as Trophy,
  TrophyTwoTone,
  SafetyCertificateFilled,
  SafetyCertificateOutlined as SafetyCertificate,
  SafetyCertificateTwoTone,
  SecurityScanFilled,
  SecurityScanOutlined as SecurityScan,
  SecurityScanTwoTone,
  PropertySafetyFilled,
  PropertySafetyOutlined,
  PropertySafetyTwoTone,
  SafetyOutlined as Safety,
  SafetyTwoTone,
  MedicineBoxFilled,
  MedicineBoxOutlined,
  MedicineBoxTwoTone,
  RestFilled,
  RestOutlined as Rest,
  RestTwoTone,
  UsbFilled,
  UsbOutlined as Usb,
  UsbTwoTone,
  GoldenFilled,
  GoldFilled,
  GoldOutlined as Gold,
  GoldTwoTone,
  ExperimentFilled,
  ExperimentOutlined as Experiment,
  ExperimentTwoTone,
  FireFilled,
  FireOutlined as Fire,
  FireTwoTone,
  ThunderboltFilled,
  ThunderboltOutlined as Thunderbolt,
  ThunderboltTwoTone,
  BugFilled,
  BugOutlined as Bug,
  BugTwoTone,
  CodeFilled,
  CodeOutlined as Code,
  CodeTwoTone,
  CrownTwoTone as Crown2,
  DashboardFilled,
  DashboardOutlined as Dashboard,
  DashboardTwoTone,
  DatabaseFilled,
  DatabaseOutlined as Database,
  DatabaseTwoTone,
  EnvironmentFilled,
  EnvironmentOutlined as Environment,
  EnvironmentTwoTone,
  FileImageFilled,
  FileImageOutlined as FileImage,
  FileImageTwoTone,
  FilterFilled,
  FilterOutlined as Filter,
  FilterTwoTone,
  FunnelPlotFilled,
  FunnelPlotOutlined as FunnelPlot,
  FunnelPlotTwoTone,
  HddFilled,
  HddOutlined,
  HddTwoTone,
  HourglassFilled,
  HourglassOutlined as Hourglass,
  HourglassTwoTone,
  IdcardFilled,
  IdcardOutlined,
  IdcardTwoTone,
  InsuranceFilled,
  InsuranceOutlined,
  InsuranceTwoTone,
  InteractionFilled,
  InteractionOutlined,
  InteractionTwoTone,
  LayoutFilled,
  LayoutOutlined,
  LayoutTwoTone,
  LikeOutlined as LikeIcon,
  LoadingOutlined as Loading,
  Loading3QuartersOutlined,
  LocationFilled,
  LocationOutlined as Location,
  LocationTwoTone,
  LockFilled as LockIcon,
  MailFilled as MailIcon,
  MedicineBoxFilled as MedicineBox,
  MessageFilled as MessageIcon,
  MoneyCollectFilled,
  MoneyCollectOutlined as MoneyCollect,
  MoneyCollectTwoTone,
  PayCircleFilled,
  PayCircleOutlined as PayCircle,
  PayCircleTwoTone,
  PhoneFilled as PhoneIcon,
  PictureOutlined as Picture,
  PictureFilled,
  PictureTwoTone,
  PieChartOutlined as PieChart,
  PrinterFilled,
  PrinterOutlined as Printer,
  PrinterTwoTone,
  ProfileFilled,
  ProfileOutlined,
  ProfileTwoTone,
  ProjectFilled,
  ProjectOutlined,
  ProjectTwoTone,
  PushpinFilled as Pushpin,
  ReadFilled,
  ReadOutlined as Read,
  ReadTwoTone,
  ReconciliationFilled,
  ReconciliationOutlined as Reconciliation,
  ReconciliationTwoTone,
  RedEnvelopeFilled,
  RedEnvelopeOutlined,
  RedEnvelopeTwoTone,
  RocketFilled as Rocket,
  ScheduleFilled,
  ScheduleOutlined,
  ScheduleTwoTone,
  SecurityScanFilled as SecurityScanIcon,
  ShopFilled,
  ShopOutlined as ShopIcon,
  ShopTwoTone,
  ShoppingFilled as Shopping,
  ShoppingOutlined as ShoppingIcon,
  ShoppingCartFilled,
  ShoppingCartOutlined as ShoppingCart,
  ShoppingCartTwoTone,
  SkinFilled,
  SkinOutlined as Skin,
  SkinTwoTone,
  SmileFilled as SmileIcon,
  StarFilled as StarIcon,
  SwitcherFilled,
  SwitcherOutlined as SwitcherIcon,
  SwitcherTwoTone,
  TabletFilled,
  TabletOutlined as Tablet,
  TabletTwoTone,
  TagFilled,
  TagOutlined,
  TagTwoTone,
  TagsFilled,
  TagsOutlined,
  TagsTwoTone,
  TeamOutlined as Team,
  ThunderboltFilled as ThunderboltIcon,
  ToolFilled,
  ToolOutlined as Tool,
  ToolTwoTone,
  TrademarkCircleFilled,
  TrademarkCircleOutlined,
  TrademarkCircleTwoTone,
  TrademarkOutlined,
  TrophyFilled as TrophyIcon,
  TruckFilled,
  TruckOutlined as Truck,
  TruckTwoTone,
  UsbFilled as UsbIcon,
  UserSwitchOutlined as UserSwitchIcon,
  VideoCameraFilled as VideoCameraIcon,
  WalletFilled,
  WalletOutlined as Wallet,
  WalletTwoTone,
  WarningFilled as Warning,
  WarningOutlined as WarningIcon,
  WarningTwoTone,
  WifiOutlined as Wifi,
  ContainerFilled,
  ContainerOutlined,
  ContainerTwoTone,
  BankFilled,
  BankOutlined as Bank,
  BankTwoTone,
  CreditCardFilled,
  CreditCardOutlined as CreditCard,
  CreditCardTwoTone,
  MoneyCollectFilled as MoneyCollectIcon,
  PayCircleFilled as PayCircleIcon,
  TransactionOutlined as Transaction,
  AccountBookFilled,
  AccountBookOutlined as AccountBook,
  AccountBookTwoTone,
  AuditFilled,
  AuditOutlined as Audit,
  AuditTwoTone,
  BarChartOutlined as BarChart,
  BoxPlotFilled as BoxPlot,
  DotChartFilled,
  DotChartOutlined as DotChart,
  DotChartTwoTone,
  FundFilled as Fund,
  FundOutlined as FundIcon,
  FundTwoTone,
  LineChartOutlined as LineChart,
  PieChartFilled as PieChartIcon,
  StockOutlined as Stock,
  RiseOutlined as Rise,
  FallOutlined as Fall,
  AreaChartOutlined as AreaChart,
  RadarChartFilled,
  RadarChartOutlined as RadarChart,
  RadarChartTwoTone,
  AppstoreFilled,
  AppstoreOutlined as AppstoreIcon,
  AppstoreTwoTone,
  AppstoreAddFilled,
  AppstoreAddOutlined as AppstoreAdd,
  AppstoreAddTwoTone,
  BellFilled as BellIcon,
  BookFilled as BookIcon,
  CalendarFilled as CalendarIcon,
  CalculatorFilled,
  CalculatorOutlined as CalculatorIcon,
  CalculatorTwoTone,
  CameraFilled as CameraIcon,
  ContactsFilled,
  ContactsOutlined as ContactsIcon,
  ContactsTwoTone,
  CreditCardFilled as CreditCardIcon,
  CustomerServiceFilled,
  CustomerServiceOutlined as CustomerService,
  CustomerServiceTwoTone,
  DashboardFilled as DashboardIcon,
  DeleteFilled as DeleteIcon,
  DeleteOutlined as Delete,
  DeleteTwoTone,
  DollarCircleFilled as DollarCircle,
  EditFilled as EditIcon,
  EditOutlined as Edit,
  EditTwoTone,
  EyeFilled as EyeIcon,
  FileTextFilled as FileTextIcon,
  FolderFilled as FolderIcon,
  GiftFilled as GiftIcon,
  HeartFilled as HeartIcon,
  HomeFilled as HomeIcon,
  LockFilled as LockFilled2,
  MailFilled as MailFilled2,
  MessageFilled as MessageFilled2,
  PhoneFilled as PhoneFilled2,
  PictureFilled as PictureIcon,
  PrinterFilled as PrinterIcon,
  ShopFilled as ShopFilled2,
  ShoppingFilled as ShoppingFilled2,
  SmileFilled as SmileFilled2,
  StarFilled as StarFilled2,
  ThunderboltFilled as ThunderboltFilled2,
  TrophyFilled as TrophyFilled2,
  UserOutlined as UserIcon,
  VideoCameraFilled as VideoCameraFilled2,
  WalletFilled as WalletIcon,
  WarningFilled as WarningFilled2,
  BankFilled as BankIcon,
  MoneyCollectFilled as MoneyCollectFilled2,
  PayCircleFilled as PayCircleFilled2,
  AccountBookFilled as AccountBookIcon,
  ContactsFilled as ContactsFilled2,
  CreditCardFilled as CreditCardFilled2,
  CalculatorFilled as CalculatorFilled2,
  DashboardFilled as DashboardFilled2,
  AppstoreFilled as AppstoreFilled2,
  BellFilled as BellFilled2,
  BookFilled as BookFilled2,
  CalendarFilled as CalendarFilled2,
  CameraFilled as CameraFilled2,
  CustomerServiceFilled as CustomerServiceIcon,
  DeleteFilled as DeleteFilled2,
  EditFilled as EditFilled2,
  EyeFilled as EyeFilled2,
  FileTextFilled as FileTextFilled2,
  FolderFilled as FolderFilled2,
  GiftFilled as GiftFilled2,
  HeartFilled as HeartFilled2,
  HomeFilled as HomeFilled2,
  LockFilled as LockFilled3,
  MailFilled as MailFilled3,
  MessageFilled as MessageFilled3,
  PhoneFilled as PhoneFilled3,
  PictureFilled as PictureFilled2,
  PrinterFilled as PrinterFilled2,
  ShopFilled as ShopFilled3,
  ShoppingFilled as ShoppingFilled3,
  SmileFilled as SmileFilled3,
  StarFilled as StarFilled3,
  ThunderboltFilled as ThunderboltFilled3,
  TrophyFilled as TrophyFilled3,
  VideoCameraFilled as VideoCameraFilled3,
  WalletFilled as WalletFilled2,
  WarningFilled as WarningFilled3,
  BankFilled as BankFilled2,
  MoneyCollectFilled as MoneyCollectFilled3,
  PayCircleFilled as PayCircleFilled3,
  AccountBookFilled as AccountBookFilled2,
  ContactsFilled as ContactsFilled3,
  CreditCardFilled as CreditCardFilled3,
  CalculatorFilled as CalculatorFilled3,
  DashboardFilled as DashboardFilled3,
  AppstoreFilled as AppstoreFilled3,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { useAuth } from '../Auth/AuthContext';
import { db, storage } from '../../firebase/firebaseConfig';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.95 }
};

const KhataBook = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] = useState(false);
  const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);
  const [isTransactionDetailModalVisible, setIsTransactionDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Data states
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    monthlyRevenue: 0
  });

  // Forms
  const [customerForm] = Form.useForm();
  const [transactionForm] = Form.useForm();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'customers'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const customersData = [];
      
      querySnapshot.forEach((doc) => {
        customersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const transactionsData = [];
      
      querySnapshot.forEach((doc) => {
        transactionsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTransactions(transactionsData);
      calculateStats(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error('Failed to fetch transactions');
    }
  }, [currentUser]);

  // Calculate statistics
  const calculateStats = useCallback((transactionsData) => {
    const totalTransactions = transactionsData.length;
    const totalAmount = transactionsData.reduce((sum, t) => sum + (t.amount || 0), 0);
    const pendingAmount = transactionsData
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const completedAmount = transactionsData
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Monthly revenue (current month)
    const currentMonth = dayjs().format('YYYY-MM');
    const monthlyRevenue = transactionsData
      .filter(t => t.createdAt && dayjs(t.createdAt.toDate()).format('YYYY-MM') === currentMonth)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    setStats({
      totalCustomers: customers.length,
      totalTransactions,
      totalAmount,
      pendingAmount,
      completedAmount,
      monthlyRevenue
    });
  }, [customers.length]);

  // Load data on component mount
  useEffect(() => {
    if (currentUser) {
      fetchCustomers();
      fetchTransactions();
    }
  }, [currentUser, fetchCustomers, fetchTransactions]);

  // Add customer
  const handleAddCustomer = async (values) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const customerData = {
        ...values,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        transactionCount: 0
      };
      
      await addDoc(collection(db, 'customers'), customerData);
      message.success('Customer added successfully');
      setIsAddCustomerModalVisible(false);
      customerForm.resetFields();
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      message.error('Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  // Add transaction
  const handleAddTransaction = async (values) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (values.image && values.image[0]) {
        const file = values.image[0].originFileObj;
        const storageRef = ref(storage, `transactions/${currentUser.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const transactionData = {
        ...values,
        userId: currentUser.uid,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        date: values.date ? Timestamp.fromDate(values.date.toDate()) : serverTimestamp()
      };
      
      // Add transaction
      await addDoc(collection(db, 'transactions'), transactionData);
      
      // Update customer stats
      if (values.customerId) {
        const customerRef = doc(db, 'customers', values.customerId);
        await updateDoc(customerRef, {
          totalAmount: increment(values.amount || 0),
          [values.status === 'completed' ? 'completedAmount' : 'pendingAmount']: increment(values.amount || 0),
          transactionCount: increment(1),
          updatedAt: serverTimestamp()
        });
      }
      
      message.success('Transaction added successfully');
      setIsAddTransactionModalVisible(false);
      transactionForm.resetFields();
      fetchTransactions();
      fetchCustomers();
    } catch (error) {
      console.error('Error adding transaction:', error);
      message.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  // Update transaction status
  const handleUpdateTransactionStatus = async (transactionId, newStatus) => {
    if (!currentUser) return;
    
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      await updateDoc(transactionRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      message.success('Transaction status updated');
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      message.error('Failed to update transaction');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (!currentUser) return;
    
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
      message.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      message.error('Failed to delete transaction');
    }
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount?.toString().includes(searchQuery)
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(t => {
        const transactionDate = dayjs(t.createdAt?.toDate());
        return transactionDate.isAfter(start) && transactionDate.isBefore(end);
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aValue = sortBy === 'date' ? a.createdAt?.toDate() : a[sortBy];
      const bValue = sortBy === 'date' ? b.createdAt?.toDate() : b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [transactions, searchQuery, filterStatus, dateRange, sortBy, sortOrder]);

  // Transaction columns
  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date?.toDate()).format('DD/MM/YYYY'),
      sorter: true,
      width: 100,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{name || 'Unknown'}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₹{amount?.toLocaleString() || 0}
        </Text>
      ),
      sorter: true,
      width: 100,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'credit' ? 'green' : 'red'}>
          {type === 'credit' ? 'Credit' : 'Debit'}
        </Tag>
      ),
      width: 80,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error'}>
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedTransaction(record);
                setIsTransactionDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                // Handle edit transaction
                transactionForm.setFieldsValue({
                  ...record,
                  date: record.date ? dayjs(record.date.toDate()) : null
                });
                setIsAddTransactionModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this transaction?"
            onConfirm={() => handleDeleteTransaction(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: 120,
    },
  ];

  // Customer columns
  const customerColumns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar
            src={record.avatar}
            icon={<UserOutlined />}
            size="large"
          />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary">{record.phone}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₹{amount?.toLocaleString() || 0}
        </Text>
      ),
      sorter: true,
    },
    {
      title: 'Pending',
      dataIndex: 'pendingAmount',
      key: 'pendingAmount',
      render: (amount) => (
        <Text style={{ color: '#faad14' }}>
          ₹{amount?.toLocaleString() || 0}
        </Text>
      ),
    },
    {
      title: 'Completed',
      dataIndex: 'completedAmount',
      key: 'completedAmount',
      render: (amount) => (
        <Text style={{ color: '#52c41a' }}>
          ₹{amount?.toLocaleString() || 0}
        </Text>
      ),
    },
    {
      title: 'Transactions',
      dataIndex: 'transactionCount',
      key: 'transactionCount',
      render: (count) => (
        <Badge count={count || 0} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setSelectedCustomer(record);
              setActiveTab('transactions');
            }}
          >
            View Transactions
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'call',
                  label: 'Call',
                  icon: <PhoneOutlined />,
                  onClick: () => window.open(`tel:${record.phone}`, '_blank')
                },
                {
                  key: 'whatsapp',
                  label: 'WhatsApp',
                  icon: <WhatsAppOutlined />,
                  onClick: () => window.open(`https://wa.me/${record.phone}`, '_blank')
                },
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <EditOutlined />,
                  onClick: () => {
                    customerForm.setFieldsValue(record);
                    setIsAddCustomerModalVisible(true);
                  }
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    // Handle delete customer
                  }
                }
              ]
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Dashboard content
  const renderDashboard = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={stats.totalTransactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              prefix="₹"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={stats.monthlyRevenue}
              prefix="₹"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Transactions" extra={<a href="#" onClick={() => setActiveTab('transactions')}>View All</a>}>
            <List
              dataSource={transactions.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<DollarOutlined />} />}
                    title={item.description}
                    description={`${item.customerName} • ${dayjs(item.createdAt?.toDate()).format('DD/MM/YYYY')}`}
                  />
                  <div>
                    <Text strong style={{ color: '#52c41a' }}>₹{item.amount}</Text>
                    <br />
                    <Tag color={item.status === 'completed' ? 'success' : 'warning'}>
                      {item.status}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Customers" extra={<a href="#" onClick={() => setActiveTab('customers')}>View All</a>}>
            <List
              dataSource={customers.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={item.phone}
                  />
                  <div>
                    <Text strong style={{ color: '#52c41a' }}>₹{item.totalAmount}</Text>
                    <br />
                    <Text type="secondary">{item.transactionCount} transactions</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </motion.div>
  );

  // Customers content
  const renderCustomers = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search customers..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">All Customers</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddCustomerModalVisible(true)}
              style={{ width: '100%' }}
            >
              Add Customer
            </Button>
          </Col>
        </Row>

        <Table
          columns={customerColumns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} customers`
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </motion.div>
  );

  // Transactions content
  const renderTransactions = () => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search transactions..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">All Transactions</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddTransactionModalVisible(true)}
              style={{ width: '100%' }}
            >
              Add Transaction
            </Button>
          </Col>
        </Row>

        <Table
          columns={transactionColumns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </motion.div>
  );

  // Main content renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'customers':
        return renderCustomers();
      case 'transactions':
        return renderTransactions();
      default:
        return renderDashboard();
    }
  };

  if (!currentUser) {
    return (
      <Result
        status="403"
        title="Authentication Required"
        subTitle="Please sign in to access Easy Khata"
        extra={
          <Button type="primary" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        }
      />
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth={isMobile ? 0 : 80}
          onBreakpoint={(broken) => {
            if (broken) setCollapsed(true);
          }}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Title 
              level={4} 
              style={{ 
                margin: 0, 
                color: '#1890ff',
                display: collapsed ? 'none' : 'block'
              }}
            >
              Easy Khata
            </Title>
            {collapsed && (
              <WalletOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            )}
          </div>
          
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => setActiveTab(key)}
            style={{ borderRight: 0, marginTop: 16 }}
            items={[
              {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
              },
              {
                key: 'customers',
                icon: <TeamOutlined />,
                label: 'Customers',
              },
              {
                key: 'transactions',
                icon: <TransactionOutlined />,
                label: 'Transactions',
              },
            ]}
          />
        </Sider>

        <Layout>
          <Header style={{ 
            background: '#fff', 
            padding: '0 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            
            <Space>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: 16 }}
              />
              <Button
                type="text"
                icon={<SettingOutlined />}
                style={{ fontSize: 16 }}
              />
            </Space>
          </Header>

          <Content style={{ margin: '16px' }}>
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </Content>
        </Layout>

        {/* Add Customer Modal */}
        <Modal
          title="Add Customer"
          open={isAddCustomerModalVisible}
          onCancel={() => {
            setIsAddCustomerModalVisible(false);
            customerForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={customerForm}
            layout="vertical"
            onFinish={handleAddCustomer}
            style={{ marginTop: 16 }}
          >
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Customer Name"
                  rules={[{ required: true, message: 'Please enter customer name' }]}
                >
                  <Input placeholder="Enter customer name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item name="email" label="Email">
              <Input placeholder="Enter email address" />
            </Form.Item>
            
            <Form.Item name="address" label="Address">
              <TextArea rows={3} placeholder="Enter address" />
            </Form.Item>
            
            <Form.Item name="notes" label="Notes">
              <TextArea rows={2} placeholder="Additional notes" />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsAddCustomerModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add Customer
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add Transaction Modal */}
        <Modal
          title="Add Transaction"
          open={isAddTransactionModalVisible}
          onCancel={() => {
            setIsAddTransactionModalVisible(false);
            transactionForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={transactionForm}
            layout="vertical"
            onFinish={handleAddTransaction}
            style={{ marginTop: 16 }}
          >
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="customerId"
                  label="Customer"
                  rules={[{ required: true, message: 'Please select customer' }]}
                >
                  <Select
                    placeholder="Select customer"
                    showSearch
                    optionFilterProp="children"
                  >
                    {customers.map(customer => (
                      <Option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: true, message: 'Please enter amount' }]}
                >
                  <InputNumber
                    placeholder="Enter amount"
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\₹\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Transaction Type"
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value="credit">Credit (Money In)</Option>
                    <Option value="debit">Debit (Money Out)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="completed">Completed</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="cancelled">Cancelled</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item name="date" label="Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item name="description" label="Description">
              <TextArea rows={3} placeholder="Enter transaction description" />
            </Form.Item>
            
            <Form.Item name="image" label="Receipt/Image">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsAddTransactionModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Add Transaction
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Transaction Detail Modal */}
        <Modal
          title="Transaction Details"
          open={isTransactionDetailModalVisible}
          onCancel={() => setIsTransactionDetailModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedTransaction && (
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Customer:</Text>
                  <br />
                  <Text>{selectedTransaction.customerName}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Amount:</Text>
                  <br />
                  <Text style={{ color: '#52c41a', fontSize: 16 }}>
                    ₹{selectedTransaction.amount?.toLocaleString()}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Type:</Text>
                  <br />
                  <Tag color={selectedTransaction.type === 'credit' ? 'green' : 'red'}>
                    {selectedTransaction.type === 'credit' ? 'Credit' : 'Debit'}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Status:</Text>
                  <br />
                  <Tag color={selectedTransaction.status === 'completed' ? 'success' : 'warning'}>
                    {selectedTransaction.status}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Date:</Text>
                  <br />
                  <Text>{dayjs(selectedTransaction.createdAt?.toDate()).format('DD/MM/YYYY HH:mm')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Transaction ID:</Text>
                  <br />
                  <Text type="secondary">{selectedTransaction.id}</Text>
                </Col>
                {selectedTransaction.description && (
                  <Col span={24}>
                    <Text strong>Description:</Text>
                    <br />
                    <Text>{selectedTransaction.description}</Text>
                  </Col>
                )}
                {selectedTransaction.imageUrl && (
                  <Col span={24}>
                    <Text strong>Receipt:</Text>
                    <br />
                    <Image
                      src={selectedTransaction.imageUrl}
                      alt="Receipt"
                      style={{ maxWidth: '100%', marginTop: 8 }}
                    />
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <FloatButton.Group
            trigger="click"
            type="primary"
            style={{ right: 24, bottom: 24 }}
            icon={<PlusOutlined />}
          >
            <FloatButton
              icon={<UserAddOutlined />}
              tooltip="Add Customer"
              onClick={() => setIsAddCustomerModalVisible(true)}
            />
            <FloatButton
              icon={<DollarOutlined />}
              tooltip="Add Transaction"
              onClick={() => setIsAddTransactionModalVisible(true)}
            />
          </FloatButton.Group>
        )}
      </Layout>
    </ConfigProvider>
  );
};

export default KhataBook;