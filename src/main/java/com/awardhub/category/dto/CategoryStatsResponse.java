package com.awardhub.category.dto;

public class CategoryStatsResponse {

    private long total;
    private long draft;
    private long active;
    private long votingOpen;
    private long votingClosed;
    private long archived;

    public CategoryStatsResponse() {}

    public CategoryStatsResponse(long total, long draft, long active, long votingOpen, long votingClosed, long archived) {
        this.total = total;
        this.draft = draft;
        this.active = active;
        this.votingOpen = votingOpen;
        this.votingClosed = votingClosed;
        this.archived = archived;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getDraft() {
        return draft;
    }

    public void setDraft(long draft) {
        this.draft = draft;
    }

    public long getActive() {
        return active;
    }

    public void setActive(long active) {
        this.active = active;
    }

    public long getVotingOpen() {
        return votingOpen;
    }

    public void setVotingOpen(long votingOpen) {
        this.votingOpen = votingOpen;
    }

    public long getVotingClosed() {
        return votingClosed;
    }

    public void setVotingClosed(long votingClosed) {
        this.votingClosed = votingClosed;
    }

    public long getArchived() {
        return archived;
    }

    public void setArchived(long archived) {
        this.archived = archived;
    }
}
