package dev.jumpers.StockPulse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {
    @RequestMapping("/")
    public String requestMethodName() {
        return "index.html";
    }

}
