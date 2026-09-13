import { useState, useRef, useEffect } from "react";
import { AdminRoute } from "@/components/admin-route";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Download, Users, FileText, Clock, CheckCircle, AlertTriangle,
  RefreshCw, Send, Lock, ArrowLeft, ExternalLink, Search, BookOpen,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: number;
  userId: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  assignedTo: string | null;
  notes: string | null;
  redditUrl: string | null;
  amount: string | null;
  requestData: any;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: string | null;
  senderRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "Quote Sent", color: "bg-blue-50 text-blue-700 border-blue-200", icon: FileText },
  processing: { label: "In Progress", color: "bg-violet-50 text-violet-700 border-violet-200", icon: RefreshCw },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-50 text-gray-500 border-gray-200", icon: AlertTriangle },
};

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/admin/tickets"],
    retry: false,
  });

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch = !searchQuery ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requestData?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requestData?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#${ticket.id}`.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  const exportToCSV = () => {
    if (!filteredTickets.length) return;
    const csvData = filteredTickets.map((ticket) => ({
      ID: ticket.id,
      Type: ticket.type,
      Priority: ticket.priority,
      Title: ticket.title,
      Description: ticket.description,
      CustomerName: ticket.requestData?.name || "",
      CustomerEmail: ticket.requestData?.email || "",
      Company: ticket.requestData?.company || "",
      Created: new Date(ticket.createdAt).toLocaleDateString(),
      Status: ticket.status,
    }));
    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repshield-cases-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${csvData.length} cases exported.` });
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === "pending").length,
    active: tickets.filter(t => t.status === "processing").length,
    completed: tickets.filter(t => t.status === "completed").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Case Management</h1>
            <p className="text-sm text-gray-500">{stats.total} total cases</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/admin/blog">
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Blog
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </header>

        {/* Stats row */}
        <div className="px-6 py-4 flex gap-3 shrink-0 border-b bg-white">
          {[
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
            { label: "Active", value: stats.active, color: "text-violet-600" },
            { label: "Completed", value: stats.completed, color: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="flex items-baseline gap-2 px-4 py-2 rounded-lg bg-gray-50">
              <span className={`text-xl font-semibold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Main content: sidebar + detail */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar: ticket list */}
          <aside className="w-[380px] border-r bg-white flex flex-col shrink-0">
            {/* Search + filter */}
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Quote Sent</SelectItem>
                  <SelectItem value="processing">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ticket list */}
            <div className="flex-1 overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No cases found</div>
              ) : (
                filteredTickets.map((ticket) => {
                  const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;
                  const isSelected = ticket.id === selectedTicketId;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full text-left px-4 py-3 border-b transition-colors ${
                        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            #{ticket.id} &middot; {ticket.requestData?.email || ticket.requestData?.name || "Unknown"}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Detail panel */}
          <main className="flex-1 flex flex-col min-h-0 bg-gray-50">
            {selectedTicket ? (
              <TicketDetail
                ticket={selectedTicket}
                onBack={() => setSelectedTicketId(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a case to view details
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}

function TicketDetail({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(ticket.status);
  const [amount, setAmount] = useState(ticket.amount || "");
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || "");
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset form when ticket changes
  useEffect(() => {
    setStatus(ticket.status);
    setAmount(ticket.amount || "");
    setAssignedTo(ticket.assignedTo || "");
    setReplyText("");
  }, [ticket.id]);

  const { data: messages = [] } = useQuery<TicketMessage[]>({
    queryKey: [`/api/admin/tickets/${ticket.id}/messages`],
    refetchInterval: 10000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const updateTicket = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest("PATCH", `/api/admin/tickets/${ticket.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({ title: "Updated", description: "Case updated." });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/tickets/${ticket.id}/messages`, {
        message: replyText.trim(),
        isInternal,
      });
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tickets/${ticket.id}/messages`] });
      toast({ title: isInternal ? "Note added" : "Reply sent" });
    },
  });

  const handleSave = () => {
    const updates: any = {};
    if (status !== ticket.status) updates.status = status;
    if (amount !== (ticket.amount || "")) updates.amount = amount;
    if (assignedTo !== (ticket.assignedTo || "")) updates.assignedTo = assignedTo;
    if (Object.keys(updates).length) updateTicket.mutate(updates);
  };

  const redditUrl = ticket.redditUrl || ticket.requestData?.redditUrl;
  const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;

  return (
    <div className="flex flex-col h-full">
      {/* Detail header */}
      <div className="px-6 py-4 bg-white border-b flex items-center gap-4 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900 truncate">{ticket.title}</h2>
            <Badge variant="outline" className={`text-xs ${config.color}`}>{config.label}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Case #{ticket.id} &middot; Opened {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Message thread */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Initial ticket info as first message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-medium text-gray-600">
                {(ticket.requestData?.name?.[0] || "C").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {ticket.requestData?.name || ticket.requestData?.email || "Customer"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
                <div className="mt-1 p-3 rounded-lg bg-white border text-sm text-gray-700">
                  {ticket.description || ticket.title}
                  {redditUrl && (
                    <a
                      href={redditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {redditUrl}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Message thread */}
            {messages.map((msg) => {
              const isAdmin = msg.senderRole === "admin";
              const isSystem = msg.senderRole === "system";
              return (
                <div key={msg.id} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                    isAdmin ? "bg-gray-900 text-white" : isSystem ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-600"
                  }`}>
                    {isAdmin ? "A" : isSystem ? "S" : "C"}
                  </div>
                  <div className={`flex-1 min-w-0 ${isAdmin ? "text-right" : ""}`}>
                    <div className={`flex items-baseline gap-2 ${isAdmin ? "justify-end" : ""}`}>
                      <span className="text-sm font-medium text-gray-900">
                        {isAdmin ? "You" : isSystem ? "System" : "Customer"}
                      </span>
                      {msg.isInternal && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" />
                          Internal
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleString("en-GB", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <div className={`mt-1 p-3 rounded-lg text-sm inline-block max-w-[85%] ${
                      isAdmin
                        ? msg.isInternal
                          ? "bg-amber-50 border border-amber-200 text-amber-900"
                          : "bg-gray-900 text-white"
                        : "bg-white border text-gray-700"
                    } ${isAdmin ? "text-left ml-auto" : ""}`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply composer */}
          <div className="border-t bg-white p-4 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsInternal(false)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  !isInternal ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Reply to customer
              </button>
              <button
                onClick={() => setIsInternal(true)}
                className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  isInternal ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Lock className="w-3 h-3" />
                Internal note
              </button>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder={isInternal ? "Add an internal note..." : "Type a reply..."}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && replyText.trim()) {
                    sendMessage.mutate();
                  }
                }}
              />
              <Button
                onClick={() => sendMessage.mutate()}
                disabled={!replyText.trim() || sendMessage.isPending}
                className="shrink-0 self-end bg-gray-900 hover:bg-gray-800"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar: case details */}
        <aside className="w-[280px] border-l bg-white p-5 overflow-y-auto shrink-0 hidden xl:block">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Case Details</h3>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Quote Sent</SelectItem>
                  <SelectItem value="processing">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Quote Amount (USD)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 h-9 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Assigned To</Label>
              <Input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Agent name"
                className="mt-1 h-9 text-sm"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={updateTicket.isPending}
              className="w-full bg-gray-900 hover:bg-gray-800 text-sm"
              size="sm"
            >
              Save Changes
            </Button>
          </div>

          <hr className="my-5" />

          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
          <div className="space-y-2 text-sm">
            {ticket.requestData?.name && (
              <div>
                <span className="text-gray-400">Name</span>
                <p className="text-gray-900">{ticket.requestData.name}</p>
              </div>
            )}
            {ticket.requestData?.email && (
              <div>
                <span className="text-gray-400">Email</span>
                <p className="text-gray-900">{ticket.requestData.email}</p>
              </div>
            )}
            {ticket.requestData?.company && (
              <div>
                <span className="text-gray-400">Company</span>
                <p className="text-gray-900">{ticket.requestData.company}</p>
              </div>
            )}
            {ticket.requestData?.brandName && (
              <div>
                <span className="text-gray-400">Brand</span>
                <p className="text-gray-900">{ticket.requestData.brandName}</p>
              </div>
            )}
            {ticket.type && (
              <div>
                <span className="text-gray-400">Type</span>
                <p className="text-gray-900 capitalize">{ticket.type}</p>
              </div>
            )}
            {ticket.priority && (
              <div>
                <span className="text-gray-400">Priority</span>
                <p className="text-gray-900 capitalize">{ticket.priority}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
