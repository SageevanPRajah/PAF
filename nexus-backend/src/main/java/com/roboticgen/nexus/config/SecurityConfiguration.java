package com.roboticgen.nexus.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.roboticgen.nexus.oauth2.CustomOAuth2UserService;
import com.roboticgen.nexus.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.roboticgen.nexus.oauth2.OAuth2AuthenticationSuccessHandler;
import com.roboticgen.nexus.service.UserService;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {

    private static final String[] WHITE_LIST_URL = { "/api/auth/**" };

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    private final ClientRegistrationRepository clientRegistrationRepository;
    private final CustomOAuth2UserService    customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    private final AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository;
    private final UserService           userService;
    private final JwtService            jwtService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors
                .configurationSource(request -> {
                    var config = new org.springframework.web.cors.CorsConfiguration();
                    config.setAllowedOrigins(List.of(
                        "http://localhost:3000",
                        "https://testmedhub.vercel.app"
                    ));
                    config.setAllowedMethods(List.of(
                        "GET", "POST", "PUT", "DELETE", "OPTIONS"
                    ));
                    config.setAllowedHeaders(List.of(
                        "Authorization",
                        "Content-Type"
                    ));
                    config.setAllowCredentials(true);
                    return config;
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(WHITE_LIST_URL).permitAll()
              .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
              .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
              .requestMatchers("/api/admin/**").hasRole("ADMIN")
              .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess
                .sessionCreationPolicy(STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            .oauth2Login(oauth2 -> oauth2
             .authorizationEndpoint(ae -> ae
               .authorizationRequestRepository(authorizationRequestRepository)
             )
             .userInfoEndpoint(ui -> ui
               .userService(customOAuth2UserService)
             )
             .successHandler(oauth2SuccessHandler)
          );
        return http.build();
    }

}
