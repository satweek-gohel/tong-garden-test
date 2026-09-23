def send_mock_email(to: str, subject: str, link: str) -> None:
    print(
        "\n"
        "──────────────────────────────────────────────────────────\n"
        "  MOCK EMAIL (no real mail service configured)\n"
        f"  To:      {to}\n"
        f"  Subject: {subject}\n"
        f"  Link:    {link}\n"
        "──────────────────────────────────────────────────────────"
    )
