import React, { useMemo, useState } from "react";
import {
  Search as SearchIcon,
  Home as HomeIcon,
  LibraryBooks as LibraryIcon,
  History as HistoryIcon,
  Explore as ExploreIcon,
  Upgrade as UpgradeIcon,
  MoreVert as MoreVertIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  ChatBubbleOutline as ChatIcon,
} from "@mui/icons-material";
import { useChatContext } from "../contexts/ChatContext";

const DRAWER_PX = 300;
const COLLAPSED_PX = 72;
const PREVIEW_COUNT = 4;

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const { recentChats = [], selectChat, startNewChat } = useChatContext();
  const [collapsed, setCollapsed] = useState(false);
  const [showAllChats, setShowAllChats] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpenCollapsed, setSearchOpenCollapsed] = useState(false);

  // filtering
  const filteredChats = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return recentChats;
    return recentChats.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [recentChats, query]);

  const visibleChats = showAllChats ? filteredChats : filteredChats.slice(0, PREVIEW_COUNT);

  const desktopWidthClass = collapsed ? "w-[72px]" : "w-[300px]";
  const mobileWidthStyle = { width: collapsed ? COLLAPSED_PX : DRAWER_PX };

  return (
    <>
      {/*Mobile drawer (slides in) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 md:hidden transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={mobileWidthStyle}
        aria-hidden={!mobileOpen}
      >
        <div className="h-full bg-white border-r shadow-lg flex flex-col">
          <SidebarInner
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            searchOpenCollapsed={searchOpenCollapsed}
            setSearchOpenCollapsed={setSearchOpenCollapsed}
            query={query}
            setQuery={setQuery}
            filteredChats={filteredChats}
            visibleChats={visibleChats}
            showAllChats={showAllChats}
            setShowAllChats={setShowAllChats}
            selectChat={selectChat}
            startNewChat={startNewChat}
            closeMobile={() => handleDrawerToggle && handleDrawerToggle()}
          />
        </div>
      </div>

      {/* Desktop (permanent)*/}
      <aside
        className={`hidden md:flex md:flex-col h-screen border-r bg-white ${desktopWidthClass} transition-[width] duration-200`}
        aria-hidden={false}
      >
        <SidebarInner
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          searchOpenCollapsed={searchOpenCollapsed}
          setSearchOpenCollapsed={setSearchOpenCollapsed}
          query={query}
          setQuery={setQuery}
          filteredChats={filteredChats}
          visibleChats={visibleChats}
          showAllChats={showAllChats}
          setShowAllChats={setShowAllChats}
          selectChat={selectChat}
          startNewChat={startNewChat}
        />
      </aside>
    </>
  );
}

function SidebarInner(props) {
  const {
    collapsed,
    setCollapsed,
    searchOpenCollapsed,
    setSearchOpenCollapsed,
    query,
    setQuery,
    filteredChats,
    visibleChats,
    showAllChats,
    setShowAllChats,
    selectChat,
    startNewChat,
    closeMobile,
  } = props;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className={`flex items-center px-3 py-3 border-b ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white text-sm font-bold">
              I
            </div>
            <div className="font-semibold text-lg text-neutral-900">Intelliq</div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white text-sm font-bold">
            I
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* Search toggle for collapsed */}
          <button
            onClick={() => {
              if (collapsed) setSearchOpenCollapsed((s) => !s);
              else {
                /* do nothing special on expanded; focus handled by input */
              }
            }}
            title="Search"
            className={`p-2 rounded-md hover:bg-gray-100 ${searchOpenCollapsed ? "bg-sky-50" : ""}`}
            aria-label="search-toggle"
          >
            <SearchIcon style={{ fontSize: 18, color: "#4B5563" }} />
          </button>

          {/* collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="toggle-sidebar"
          >
            {collapsed ? (
              <ChevronRightIcon style={{ fontSize: 18 }} />
            ) : (
              <ChevronLeftIcon style={{ fontSize: 18 }} />
            )}
          </button>

          {/* if closeMobile provided (mobile mode), show close button (optional) */}
          {typeof closeMobile === "function" && (
            <button
              onClick={closeMobile}
              className="ml-1 p-2 rounded-md hover:bg-gray-100 md:hidden"
              title="Close"
            >
              <MoreVert as="span" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsed-search small input */}
      {collapsed && searchOpenCollapsed && (
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
            <SearchIcon style={{ fontSize: 18, color: "#6B7280" }} />
            <input
              className="bg-transparent outline-none text-sm w-full"
              placeholder="Search chats..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="p-1"
                onClick={() => {
                  setQuery("");
                  setSearchOpenCollapsed(false);
                }}
              >
                <MoreVertIcon style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expanded search */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-lg">
            <SearchIcon style={{ fontSize: 18, color: "#6B7280" }} />
            <input
              className="bg-transparent outline-none text-sm w-full"
              placeholder="Search for chats..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="p-1"
                onClick={() => {
                  setQuery("");
                }}
                aria-label="clear-search"
              >
                <MoreVertIcon style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="px-1 py-1">
        <NavItem
          collapsed={collapsed}
          icon={<HomeIcon style={{ fontSize: 20, color: "#2563eb" }} />}
          label="Home"
          shortcut="⌘H"
          onClick={startNewChat}
          active
        />
        <NavItem
          collapsed={collapsed}
          icon={<LibraryIcon style={{ fontSize: 20 }} />}
          label="Library"
          shortcut="⌘T"
        />
        <NavItem
          collapsed={collapsed}
          icon={<HistoryIcon style={{ fontSize: 20 }} />}
          label="History"
          shortcut="⌘G"
          
        />
        <NavItem
          collapsed={collapsed}
          icon={<ExploreIcon style={{ fontSize: 20 }} />}
          label="Explore"
          shortcut="⌘L"
        />
      </div>

      {/* Recent Chats area*/}
      <div className="flex-1 flex flex-col px-1 min-h-0">
        {!collapsed && (
          <div className="px-1 py-2 text-xs font-semibold text-gray-600">Recent Chats</div>
        )}

        {/* scrollable list */}
        <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0 ">
          {visibleChats.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {!filteredChats.length ? "No chats yet" : "No chats match your search"}
            </div>
          ) : (
            visibleChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  selectChat && selectChat(chat.id);
                }}
                title={collapsed ? chat.title : undefined}
                className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-md mb-1 text-left hide-scrollbar"
              >
                {/* icon when collapsed */}
                {collapsed ? (
                  <div className="flex items-center justify-center w-full">
                    <HistoryIcon style={{ fontSize: 20, color: "#6B7280" }} />
                  </div>
                ) : (
                  <div className="flex-1 px-1 min-w-0">
                    <div className="text-sm text-neutral-800 truncate">{chat.title}</div>
                  </div>
                )}
              </button>
            ))
          )}
        {/* See more / See less - sits below scroll */}
        {!collapsed && filteredChats.length > PREVIEW_COUNT && (
          <div className="px-1 py-2">
            {!showAllChats ? (
              <button
                onClick={() => setShowAllChats(true)}
                className="text-sm text-sky-600 hover:underline flex items-center gap-2"
              >
                See more <ChevronRightIcon style={{ fontSize: 14 }} />
              </button>
            ) : (
              <button
                onClick={() => setShowAllChats(false)}
                className="text-sm text-sky-600 hover:underline flex items-center gap-2"
              >
                See less <ChevronLeftIcon style={{ fontSize: 14 }} />
              </button>
            )}
          </div>
        )}
      </div>
        </div>


      {/* Try Pro area */}
      <div className={`px-${collapsed ? "1" : "3"} py-3 flex-shrink-0`}>
        {!collapsed ? (
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 flex items-center gap-3">
            <UpgradeIcon style={{ fontSize: 18, color: "#2563eb" }} />
            <div className="flex-1">
              <div className="font-semibold text-sm text-neutral-900">Try Pro!</div>
              <div className="text-xs text-gray-500">Upgrade for smarter AI and more...</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="rounded-full bg-sky-50 border border-sky-100 px-3 py-1 flex items-center gap-2">
              <UpgradeIcon style={{ fontSize: 16, color: "#2563eb" }} />
              <div className="text-xs font-semibold">Try Pro!</div>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="px-3 py-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">L</div>
          {!collapsed && (
            <>
              <div className="flex-1 pl-2">
                <div className="font-medium text-sm text-neutral-900">Lawrence Cruz</div>
              </div>
              <button className="p-1 rounded-md hover:bg-gray-100">
                <MoreVertIcon style={{ fontSize: 18 }} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* Nav item helper */
function NavItem({ collapsed, icon, label, shortcut, onClick, active }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-2 px-3 py-4 rounded-xl mb-1 transition-all duration-200
        ${active
          ? "shadow-[0_0_8px_1px_rgba(0,0,0,0.1)]"
          : "bg-white hover:shadow-[0_0_12px_2px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"}
      `}
    >
      <div className="flex items-center justify-center w-9">
        {icon}
      </div>

      {!collapsed && (
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-gray-800">{label}</span>

          {shortcut && (
            <span className="ml-2 text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5 font-medium">
              {shortcut}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

/* tiny MoreVert placeholder when closeMobile is used */
function MoreVert() {
  return <MoreVertIcon style={{ fontSize: 18 }} />;
}
